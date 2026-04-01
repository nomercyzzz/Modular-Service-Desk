import { describe, expect, it, vi } from "vitest";
import { createBootstrappedTestApp } from "./helpers/create-bootstrapped-test-app.js";

describe("DI внедрение зависимостей", () => {
  it("report/export используют ticketService из контейнера", async () => {
    const sourceTickets = [
      {
        id: 77,
        title: "Проблема с доступом",
        description: "Не открывается сервисный портал",
        status: "открыт",
        createdAt: "2026-04-02T10:00:00.000Z"
      }
    ];

    const getAllSpy = vi.fn(() => sourceTickets);

    const ticketService = {
      create: vi.fn((input) => ({
        id: 100,
        title: input.title,
        description: input.description,
        status: "открыт",
        createdAt: "2026-04-02T10:01:00.000Z"
      })),
      getAll: getAllSpy
    };

    const loggerService = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    const { container } = await createBootstrappedTestApp({
      ticketService,
      loggerService
    });

    const reportService = container.resolve("reportService");
    const exportService = container.resolve("exportService");

    const summary = reportService.getSummary();
    const exportPayload = exportService.buildTicketExport();

    expect(summary).toMatchObject({
      total: 1,
      lastTicketId: 77
    });
    expect(exportPayload.summary.total).toBe(1);
    expect(exportPayload.tickets).toEqual(sourceTickets);
    expect(getAllSpy).toHaveBeenCalled();
    expect(getAllSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
