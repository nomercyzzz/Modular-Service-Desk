export class ModuleError extends Error {
  constructor(message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = this.constructor.name;
  }
}

export class ModuleEntryNotFoundError extends ModuleError {
  constructor(moduleName, entryPath) {
    super(`Для модуля "${moduleName}" не найден entry point: ${entryPath}.`);
  }
}

export class ModuleImportError extends ModuleError {
  constructor(moduleName, entryPath, cause) {
    super(`Не удалось импортировать модуль "${moduleName}" из ${entryPath}.`, cause);
  }
}

export class ModuleDefinitionNotFoundError extends ModuleError {
  constructor(moduleName, entryPath) {
    super(
      `Модуль "${moduleName}" в ${entryPath} должен экспортировать объект контракта (default export).`
    );
  }
}

export class ModuleContractValidationError extends ModuleError {
  constructor(moduleName, reason, cause) {
    super(`Модуль "${moduleName}" не прошел валидацию контракта: ${reason}.`, cause);
  }
}

export class ModuleNameMismatchError extends ModuleError {
  constructor(expectedName, actualName) {
    super(
      `Имя модуля в конфигурации ("${expectedName}") не совпадает с module.name ("${actualName}").`
    );
  }
}

export class ModuleBootstrapError extends ModuleError {
  constructor(moduleName, stage, cause) {
    super(`Ошибка на этапе "${stage}" при запуске модуля "${moduleName}".`, cause);
  }
}

export class RequiredModuleNotFoundError extends ModuleError {
  constructor(moduleName, requiredModuleName) {
    super(
      `Модуль "${moduleName}" требует "${requiredModuleName}", но этот модуль не найден среди загруженных.`
    );
  }
}

export class ModuleDependencyCycleError extends ModuleError {
  constructor(cyclePath) {
    super(`Обнаружен цикл зависимостей модулей: ${cyclePath.join(" -> ")}.`);
  }
}
