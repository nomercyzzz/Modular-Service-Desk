import { fileURLToPath } from "node:url";
import { createApp } from "../../src/app.js";
import { ServiceContainer } from "../../src/core/container/service-container.js";
import { resolveModuleStartOrder } from "../../src/core/loader/module-dependency-graph.js";
import { bootstrapModules } from "../../src/core/loader/module-bootstrapper.js";
import { loadModuleRegistry } from "../../src/core/loader/module-registry.js";
import { TicketService } from "../../src/services/ticket.service.js";

const DEFAULT_ACTIVE_MODULES = [
  "export-module",
  "report-module",
  "validation-module",
  "logger-module"
];

const MODULES_DIRECTORY_PATH = fileURLToPath(new URL("../../modules", import.meta.url));

export async function createBootstrappedTestApp(options = {}) {
  const activeModules = options.activeModules || DEFAULT_ACTIVE_MODULES;
  const loggerService = options.loggerService || createNoopLogger();
  const ticketService = options.ticketService || new TicketService();
  const modulesDirectoryPath = options.modulesDirectoryPath || MODULES_DIRECTORY_PATH;

  const container = new ServiceContainer();
  container.registerSingleton("loggerService", () => loggerService);
  container.registerSingleton("ticketService", () => ticketService);

  const app = createApp({ container });

  const modules = await loadModuleRegistry({
    modulesDirectoryPath,
    activeModules
  });

  const orderedModules = resolveModuleStartOrder(modules);

  await bootstrapModules({
    modules: orderedModules,
    container,
    context: {
      app,
      logger: container.resolve("loggerService"),
      config: {
        port: 3000,
        activeModules
      }
    }
  });

  return {
    app,
    container,
    loggerService,
    ticketService,
    orderedModules
  };
}

function createNoopLogger() {
  return {
    info() {},
    warn() {},
    error() {}
  };
}
