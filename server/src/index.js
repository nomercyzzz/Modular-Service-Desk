import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { ServiceContainer } from "./core/container/service-container.js";
import { readAppSettings } from "./core/config/app-settings.js";
import { bootstrapModules } from "./core/loader/module-bootstrapper.js";
import { loadModuleRegistry } from "./core/loader/module-registry.js";
import { LoggerService } from "./services/logger.service.js";
import { TicketService } from "./services/ticket.service.js";

export function buildContainer() {
  const container = new ServiceContainer();

  container.registerSingleton("loggerService", () => new LoggerService());
  container.registerSingleton("ticketService", () => new TicketService());

  return container;
}

const MODULES_DIRECTORY_PATH = fileURLToPath(new URL("../modules", import.meta.url));

export async function startServer(options = {}) {
  const appSettings = await readAppSettings({ filePath: options.appSettingsPath });
  const container = buildContainer();
  const logger = container.resolve("loggerService");
  const app = createApp({ container });

  const modules = await loadModuleRegistry({
    modulesDirectoryPath: options.modulesDirectoryPath || MODULES_DIRECTORY_PATH,
    activeModules: appSettings.activeModules
  });

  const initializedModules = await bootstrapModules({
    modules,
    container,
    context: {
      app,
      config: appSettings,
      logger
    }
  });

  const server = app.listen(appSettings.port, () => {
    logger.info(`Сервер запущен: http://localhost:${appSettings.port}`);
    logger.info(`Активные модули: ${initializedModules.join(", ") || "нет"}.`);
  });

  return { app, server, container, appSettings, modules: initializedModules };
}

const currentFilePath = fileURLToPath(import.meta.url);
const entryFilePath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFilePath === entryFilePath) {
  startServer().catch((error) => {
    console.error(`Ошибка запуска приложения: ${error.message}`);
    process.exit(1);
  });
}
