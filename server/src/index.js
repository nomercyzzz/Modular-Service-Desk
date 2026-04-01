import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { ServiceContainer } from "./core/container/service-container.js";
import { LoggerService } from "./services/logger.service.js";
import { TicketService } from "./services/ticket.service.js";

export function buildContainer() {
  const container = new ServiceContainer();

  container.registerSingleton("loggerService", () => new LoggerService());
  container.registerSingleton("ticketService", () => new TicketService());

  return container;
}

export function startServer() {
  const container = buildContainer();
  const logger = container.resolve("loggerService");
  const app = createApp({ container });

  const server = app.listen(3000, () => {
    logger.info("Сервер запущен: http://localhost:3000");
  });

  return { app, server, container };
}

const currentFilePath = fileURLToPath(import.meta.url);
const entryFilePath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFilePath === entryFilePath) {
  startServer();
}
