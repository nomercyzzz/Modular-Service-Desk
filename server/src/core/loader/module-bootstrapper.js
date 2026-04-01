import { ModuleBootstrapError } from "../errors/module-error.js";

export async function bootstrapModules(options = {}) {
  const modules = Array.isArray(options.modules) ? options.modules : [];
  const container = options.container;
  const baseContext = options.context || {};
  const context = { ...baseContext, container };

  for (const moduleDefinition of modules) {
    await runStage(moduleDefinition, "register", () =>
      moduleDefinition.register(container, context)
    );
  }

  for (const moduleDefinition of modules) {
    await runStage(moduleDefinition, "init", () => moduleDefinition.init(context));
  }

  return modules.map((moduleDefinition) => moduleDefinition.name);
}

async function runStage(moduleDefinition, stage, callback) {
  try {
    await callback();
  } catch (error) {
    throw new ModuleBootstrapError(moduleDefinition.name, stage, error);
  }
}
