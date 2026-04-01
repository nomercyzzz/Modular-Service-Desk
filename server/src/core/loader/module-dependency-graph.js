import { ModuleDependencyCycleError,RequiredModuleNotFoundError } from "../errors/module-error.js";

export function buildModuleDependencyGraph(modules) {
  const modulesByName = indexModulesByName(modules);
  const graph = new Map();

  for (const moduleDefinition of modules) {
    const dependencies = [...moduleDefinition.requiredModules];
    graph.set(moduleDefinition.name, dependencies);

    for (const dependencyName of dependencies) {
      if (!modulesByName.has(dependencyName)) {
        throw new RequiredModuleNotFoundError(moduleDefinition.name, dependencyName);
      }
    }
  }

  return { graph, modulesByName };
}

export function resolveModuleStartOrder(modules) {
  const { graph, modulesByName } = buildModuleDependencyGraph(modules);
  const states = new Map();
  const order = [];
  const currentPath = [];

  for (const moduleName of graph.keys()) {
    if (!states.has(moduleName)) {
      visit(moduleName, graph, states, order, currentPath);
    }
  }

  return order.map((moduleName) => modulesByName.get(moduleName));
}

function indexModulesByName(modules) {
  if (!Array.isArray(modules)) {
    throw new Error('Параметр "modules" должен быть массивом.');
  }

  const modulesByName = new Map();

  for (const moduleDefinition of modules) {
    modulesByName.set(moduleDefinition.name, moduleDefinition);
  }

  return modulesByName;
}

function visit(moduleName, graph, states, order, currentPath) {
  const state = states.get(moduleName);
  if (state === "visited") {
    return;
  }

  if (state === "visiting") {
    const cycleStartIndex = currentPath.indexOf(moduleName);
    const cyclePath = currentPath.slice(cycleStartIndex).concat(moduleName);
    throw new ModuleDependencyCycleError(cyclePath);
  }

  states.set(moduleName, "visiting");
  currentPath.push(moduleName);

  const dependencies = graph.get(moduleName) || [];
  for (const dependencyName of dependencies) {
    visit(dependencyName, graph, states, order, currentPath);
  }

  currentPath.pop();
  states.set(moduleName, "visited");
  order.push(moduleName);
}
