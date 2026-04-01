import path from "node:path";
import { access } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  ModuleDefinitionNotFoundError,
  ModuleEntryNotFoundError,
  ModuleImportError
} from "../errors/module-error.js";

export function resolveModuleEntryPath(modulesDirectoryPath, moduleName) {
  return path.resolve(modulesDirectoryPath, moduleName, "index.js");
}

export async function resolveModuleDefinition(modulesDirectoryPath, moduleName) {
  const entryPath = resolveModuleEntryPath(modulesDirectoryPath, moduleName);

  await assertEntryExists(moduleName, entryPath);

  const importedModule = await importModuleFile(moduleName, entryPath);
  const moduleDefinition = pickModuleDefinition(importedModule);

  if (!moduleDefinition || typeof moduleDefinition !== "object" || Array.isArray(moduleDefinition)) {
    throw new ModuleDefinitionNotFoundError(moduleName, entryPath);
  }

  return { entryPath, moduleDefinition };
}

async function assertEntryExists(moduleName, entryPath) {
  try {
    await access(entryPath);
  } catch (error) {
    throw new ModuleEntryNotFoundError(moduleName, entryPath);
  }
}

async function importModuleFile(moduleName, entryPath) {
  try {
    return await import(pathToFileURL(entryPath).href);
  } catch (error) {
    throw new ModuleImportError(moduleName, entryPath, error);
  }
}

function pickModuleDefinition(importedModule) {
  if (importedModule?.default) {
    return importedModule.default;
  }

  if (importedModule?.moduleDefinition) {
    return importedModule.moduleDefinition;
  }

  return null;
}
