const reportModule = {
  name: "report-module",
  requiredModules: ["logger-module", "validation-module"],
  register(container) {
    if (!container.has("reportService")) {
      container.registerSingleton("reportService", (scope) => {
        const ticketService = scope.resolve("ticketService");

        return {
          getSummary() {
            const tickets = ticketService.getAll();
            const byStatus = tickets.reduce((accumulator, ticket) => {
              const status = typeof ticket.status === "string" ? ticket.status : "неизвестно";
              accumulator[status] = (accumulator[status] || 0) + 1;
              return accumulator;
            }, {});

            return {
              total: tickets.length,
              byStatus,
              lastTicketId: tickets.length > 0 ? tickets[tickets.length - 1].id : null
            };
          }
        };
      });
    }
  },
  init(context) {
    const reportService = context.container.resolve("reportService");
    const actionLogger = context.container.resolve("actionLogger");

    context.app.get("/api/reports/summary", (request, response) => {
      const summary = reportService.getSummary();
      actionLogger.log("report.summary.requested", summary);
      response.status(200).json(summary);
    });

    context.logger.info('Модуль "report-module" активирован.');
  }
};

export default reportModule;
