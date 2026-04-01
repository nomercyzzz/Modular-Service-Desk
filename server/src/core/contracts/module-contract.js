export class ModuleContractError extends Error {
  constructor(message) {
    super(message);
    this.name = "ModuleContractError";
  }
}

export const MODULE_CONTRACT_KEYS = Object.freeze({
  NAME: "name",
  REQUIRED_MODULES: "requiredModules",
  REGISTER: "register",
  INIT: "init"
});

export function validateModuleContract(moduleDefinition) {
  if (!moduleDefinition || typeof moduleDefinition !== "object" || Array.isArray(moduleDefinition)) {
    throw new ModuleContractError("Модуль должен быть объектом.");
  }

  validateName(moduleDefinition.name);
  validateRequiredModules(moduleDefinition.requiredModules);
  validateHook(moduleDefinition.register, "register");
  validateHook(moduleDefinition.init, "init");

  return true;
}

function validateName(name) {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new ModuleContractError('Поле модуля "name" должно быть непустой строкой.');
  }
}

function validateRequiredModules(requiredModules) {
  if (!Array.isArray(requiredModules)) {
    throw new ModuleContractError('Поле модуля "requiredModules" должно быть массивом.');
  }

  for (const moduleName of requiredModules) {
    if (typeof moduleName !== "string" || moduleName.trim().length === 0) {
      throw new ModuleContractError(
        'Каждое значение в "requiredModules" должно быть непустой строкой.'
      );
    }
  }
}

function validateHook(hook, hookName) {
  if (typeof hook !== "function") {
    throw new ModuleContractError(`Поле модуля "${hookName}" должно быть функцией.`);
  }
}
