import { validateModuleContract } from "../contracts/module-contract.js";
import { ModuleContractError } from "../errors/module-contract-error.js";
import {
  ModuleContractValidationError,
  ModuleNameMismatchError
} from "../errors/module-error.js";
import { resolveModuleDefinition } from "./module-resolver.js";

export async function loadModuleRegistry(options = {}) {
  const modulesDirectoryPath = options.modulesDirectoryPath;
  const activeModules = options.activeModules;

  if (typeof modulesDirectoryPath !== "string" || modulesDirectoryPath.trim().length === 0) {
    throw new Error('Параметр "modulesDirectoryPath" должен быть непустой строкой.');
  }

  if (!Array.isArray(activeModules)) {
    throw new Error('Параметр "activeModules" должен быть массивом.');
  }

  const registry = [];

  for (const moduleName of activeModules) {
    const loadedModule = await resolveModuleDefinition(modulesDirectoryPath, moduleName);
    validateLoadedModule(moduleName, loadedModule.moduleDefinition);

    registry.push({
      name: loadedModule.moduleDefinition.name,
      requiredModules: [...loadedModule.moduleDefinition.requiredModules],
      register: loadedModule.moduleDefinition.register,
      init: loadedModule.moduleDefinition.init,
      entryPath: loadedModule.entryPath
    });
  }

  return registry;
}

function validateLoadedModule(expectedName, moduleDefinition) {
  try {
    validateModuleContract(moduleDefinition);
  } catch (error) {
    if (error instanceof ModuleContractError) {
      throw new ModuleContractValidationError(expectedName, error.message, error);
    }

    throw error;
  }

  if (moduleDefinition.name !== expectedName) {
    throw new ModuleNameMismatchError(expectedName, moduleDefinition.name);
  }
}
