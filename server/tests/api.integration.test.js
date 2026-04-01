import request from "supertest";
import { describe, expect, it } from "vitest";
import { createBootstrappedTestApp } from "./helpers/create-bootstrapped-test-app.js";

describe("API интеграционные сценарии", () => {
  it("возвращает 400 при невалидных данных создания тикета", async () => {
    const { app } = await createBootstrappedTestApp();

    const response = await request(app).post("/api/tickets").send({
      title: "ab",
      description: "1234"
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Поле "title" должно содержать минимум 3 символа.'
    });
  });

  it("создаёт тикет и отдаёт отчёт с экспортом", async () => {
    const { app } = await createBootstrappedTestApp();

    const createResponse = await request(app).post("/api/tickets").send({
      title: "Проблема с VPN",
      description: "VPN не подключается утром"
    });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      title: "Проблема с VPN",
      description: "VPN не подключается утром",
      status: "открыт"
    });

    const listResponse = await request(app).get("/api/tickets");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);

    const reportResponse = await request(app).get("/api/reports/summary");
    expect(reportResponse.status).toBe(200);
    expect(reportResponse.body).toMatchObject({
      total: 1,
      byStatus: {
        открыт: 1
      }
    });

    const exportResponse = await request(app).get("/api/exports/tickets");
    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers["content-disposition"]).toContain("tickets-export.json");

    const exportPayload = JSON.parse(exportResponse.text);
    expect(exportPayload.summary.total).toBe(1);
    expect(exportPayload.tickets).toHaveLength(1);
    expect(exportPayload.tickets[0]).toMatchObject({
      title: "Проблема с VPN"
    });
  });
});
