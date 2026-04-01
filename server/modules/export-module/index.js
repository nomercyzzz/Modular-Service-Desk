const exportModule = {
  name: "export-module",
  requiredModules: ["report-module"],
  register(container) {
    if (!container.has("exportService")) {
      container.registerSingleton("exportService", (scope) => {
        const ticketService = scope.resolve("ticketService");
        const reportService = scope.resolve("reportService");

        return {
          buildTicketExport() {
            return {
              exportedAt: new Date().toISOString(),
              summary: reportService.getSummary(),
              tickets: ticketService.getAll()
            };
          }
        };
      });
    }
  },
  init(context) {
    const exportService = context.container.resolve("exportService");
    const actionLogger = context.container.resolve("actionLogger");

    context.app.get("/api/exports/tickets", (request, response) => {
      const payload = exportService.buildTicketExport();
      actionLogger.log("tickets.export.requested", {
        count: payload.tickets.length
      });

      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Content-Disposition", 'attachment; filename="tickets-export.json"');
      response.status(200).send(JSON.stringify(payload, null, 2));
    });

    context.logger.info('Модуль "export-module" активирован.');
  }
};

export default exportModule;
