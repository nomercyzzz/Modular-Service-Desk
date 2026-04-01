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

  return app;
}
