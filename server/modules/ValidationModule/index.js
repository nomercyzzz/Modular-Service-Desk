const validationModule = {
  name: "ValidationModule",
  requiredModules: ["LoggingModule"],
  register(container) {
    if (!container.has("inputValidator")) {
      container.registerTransient("inputValidator", () => ({
        isValidTitle(value) {
          return typeof value === "string" && value.trim().length >= 3;
        }
      }));
    }
  },
  init(context) {
    context.logger?.info('Инициализирован модуль "ValidationModule".');
  }
};

export default validationModule;
