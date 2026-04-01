const validationModule = {
  name: "validation-module",
  requiredModules: ["logger-module"],
  register(container) {
    if (!container.has("ticketValidator")) {
      container.registerSingleton("ticketValidator", () => {
        return {
          validateCreate(input) {
            const title = typeof input.title === "string" ? input.title.trim() : "";
            const description =
              typeof input.description === "string" ? input.description.trim() : "";

            if (title.length < 3) {
              throw createValidationError('Поле "title" должно содержать минимум 3 символа.');
            }

            if (description.length < 5) {
              throw createValidationError('Поле "description" должно содержать минимум 5 символов.');
            }

            return {
              ...input,
              title,
              description
            };
          }
        };
      });
    }
  },
  init(context) {
    const ticketService = context.container.resolve("ticketService");
    const ticketValidator = context.container.resolve("ticketValidator");
    const actionLogger = context.container.resolve("actionLogger");

    if (!ticketService.__validationModuleApplied) {
      const originalCreate = ticketService.create.bind(ticketService);

      ticketService.create = (input) => {
        const normalizedInput = ticketValidator.validateCreate(input || {});
        return originalCreate(normalizedInput);
      };

      Object.defineProperty(ticketService, "__validationModuleApplied", {
        value: true,
        enumerable: false
      });
    }

    actionLogger.log("validation.enabled", {
      target: "ticketService.create"
    });
    context.logger.info('Модуль "validation-module" активирован.');
  }
};

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

export default validationModule;
