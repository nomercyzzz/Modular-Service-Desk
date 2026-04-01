import express from "express";

export function createApp(options = {}) {
  const app = express();

  if (options.container) {
    app.locals.container = options.container;
  }

  app.use(express.json());

  app.get("/health", (request, response) => {
    response.status(200).json({ status: "работает" });
  });

  app.get("/api/tickets", (request, response) => {
    try {
      const ticketService = resolveRequiredService(app, "ticketService");
      const tickets = ticketService.getAll();
      response.status(200).json({ items: tickets });
    } catch (error) {
      handleRouteError(app, response, error);
    }
  });

  app.post("/api/tickets", (request, response) => {
    try {
      const ticketService = resolveRequiredService(app, "ticketService");
      const createdTicket = ticketService.create(request.body || {});
      response.status(201).json(createdTicket);
    } catch (error) {
      handleRouteError(app, response, error);
    }
  });

  return app;
}

function resolveRequiredService(app, token) {
  const container = app.locals.container;

  if (!container || !container.has(token)) {
    const error = new Error(`Сервис "${token}" недоступен.`);
    error.code = "INTERNAL_ERROR";
    throw error;
  }

  return container.resolve(token);
}

function resolveOptionalService(app, token) {
  const container = app.locals.container;

  if (!container || !container.has(token)) {
    return null;
  }

  return container.resolve(token);
}

function handleRouteError(app, response, error) {
  const logger = resolveOptionalService(app, "loggerService");
  if (logger) {
    logger.error(`Ошибка запроса API: ${error.message}`);
  }

  const isValidationError = error?.code === "VALIDATION_ERROR";
  const statusCode = isValidationError ? 400 : 500;

  response.status(statusCode).json({
    error: isValidationError ? error.message : "Внутренняя ошибка сервера."
  });
}
