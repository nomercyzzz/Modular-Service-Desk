const loggingModule = {
  name: "LoggingModule",
  requiredModules: [],
  register(container) {
    if (!container.has("loggingOptions")) {
      container.registerSingleton("loggingOptions", () => ({
        includeRequestId: false
      }));
    }
  },
  init(context) {
    context.logger?.info('Инициализирован модуль "LoggingModule".');
  }
};

export default loggingModule;
