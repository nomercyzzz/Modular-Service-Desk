const loggerModule = {
  name: "logger-module",
  requiredModules: [],
  register(container) {
    if (!container.has("actionLogger")) {
      container.registerSingleton("actionLogger", (scope) => {
        const logger = scope.resolve("loggerService");

        return {
          log(action, details) {
            logger.info(`Действие: ${action}.`, details);
          }
        };
      });
    }
  },
  init(context) {
    const ticketService = context.container.resolve("ticketService");
    const actionLogger = context.container.resolve("actionLogger");

    if (!ticketService.__loggerModuleApplied) {
      const originalCreate = ticketService.create.bind(ticketService);
      const originalGetAll = ticketService.getAll.bind(ticketService);

      ticketService.create = (input) => {
        const createdTicket = originalCreate(input);
        actionLogger.log("ticket.created", {
          ticketId: createdTicket.id,
          title: createdTicket.title
        });

        return createdTicket;
      };

      ticketService.getAll = () => {
        const tickets = originalGetAll();
        actionLogger.log("tickets.listed", { count: tickets.length });
        return tickets;
      };

      Object.defineProperty(ticketService, "__loggerModuleApplied", {
        value: true,
        enumerable: false
      });
    }

    context.logger.info('Модуль "logger-module" активирован.');
  }
};

export default loggerModule;
