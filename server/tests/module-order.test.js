import { describe, expect, it } from "vitest";
import { ServiceContainer } from "../src/core/container/service-container.js";
import { resolveModuleStartOrder } from "../src/core/loader/module-dependency-graph.js";
import { bootstrapModules } from "../src/core/loader/module-bootstrapper.js";

describe("Порядок запуска модулей", () => {
  it("запускает линейную цепочку зависимостей в правильном порядке", async () => {
    const events = [];
    const modules = [
      createTestModule("export-module", ["report-module"], events),
      createTestModule("validation-module", ["logger-module"], events),
      createTestModule("report-module", ["validation-module"], events),
      createTestModule("logger-module", [], events)
    ];

    const orderedModules = resolveModuleStartOrder(modules);
    expect(orderedModules.map((moduleItem) => moduleItem.name)).toEqual([
      "logger-module",
      "validation-module",
      "report-module",
      "export-module"
    ]);

    await bootstrapModules({
      modules: orderedModules,
      container: new ServiceContainer(),
      context: {}
    });

    expect(events).toEqual([
      "register:logger-module",
      "register:validation-module",
      "register:report-module",
      "register:export-module",
      "init:logger-module",
      "init:validation-module",
      "init:report-module",
      "init:export-module"
    ]);
  });

  it("корректно запускает разветвлённый граф зависимостей", async () => {
    const events = [];
    const modules = [
      createTestModule("api-module", ["billing-module", "notifications-module"], events),
      createTestModule("notifications-module", ["shared-module"], events),
      createTestModule("billing-module", ["shared-module"], events),
      createTestModule("shared-module", [], events)
    ];

    const orderedModules = resolveModuleStartOrder(modules);
    expect(orderedModules.map((moduleItem) => moduleItem.name)).toEqual([
      "shared-module",
      "billing-module",
      "notifications-module",
      "api-module"
    ]);

    await bootstrapModules({
      modules: orderedModules,
      container: new ServiceContainer(),
      context: {}
    });

    expect(events).toEqual([
      "register:shared-module",
      "register:billing-module",
      "register:notifications-module",
      "register:api-module",
      "init:shared-module",
      "init:billing-module",
      "init:notifications-module",
      "init:api-module"
    ]);
  });
});

function createTestModule(name, requiredModules, events) {
  return {
    name,
    requiredModules,
    register() {
      events.push(`register:${name}`);
    },
    init() {
      events.push(`init:${name}`);
    }
  };
}
