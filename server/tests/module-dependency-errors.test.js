import { describe, expect, it } from "vitest";
import { resolveModuleStartOrder } from "../src/core/loader/module-dependency-graph.js";

describe("Ошибки зависимостей модулей", () => {
  it("выдаёт понятную ошибку, если отсутствует требуемый модуль", () => {
    const modules = [createModule("report-module", ["logger-module"])];

    expect(() => resolveModuleStartOrder(modules)).toThrowError(
      'Модуль "report-module" требует "logger-module", но этот модуль не найден среди загруженных.'
    );
  });

  it("выдаёт понятную ошибку при циклической зависимости", () => {
    const modules = [
      createModule("module-a", ["module-b"]),
      createModule("module-b", ["module-c"]),
      createModule("module-c", ["module-a"])
    ];

    expect(() => resolveModuleStartOrder(modules)).toThrowError(
      "обнаружен цикл зависимостей модулей: module-a -> module-b -> module-c -> module-a."
    );
  });
});

function createModule(name, requiredModules = []) {
  return {
    name,
    requiredModules,
    register() {},
    init() {}
  };
}
