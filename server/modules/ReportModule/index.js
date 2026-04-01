const reportModule = {
  name: "ReportModule",
  requiredModules: ["LoggingModule", "ValidationModule"],
  register(container) {
    if (!container.has("reportService")) {
      container.registerSingleton("reportService", (scope) => {
        const ticketService = scope.resolve("ticketService");

        return {
          getSummary() {
            const tickets = ticketService.getAll();

            return {
              totalTickets: tickets.length
            };
          }
        };
      });
    }
  },
  init(context) {
    context.logger?.info('Инициализирован модуль "ReportModule".');
  }
};

export default reportModule;
