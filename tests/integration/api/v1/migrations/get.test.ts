import { beforeAll, describe, expect, test } from "@jest/globals";
import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Should not access", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar essa ação",
        action: 'Verifique se seu usuário possui a feature "read:migrations".',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Should not access", async () => {
      const { session } = await orchestrator.createAuthenticatedUser();

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
      });

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar essa ação",
        action: 'Verifique se seu usuário possui a feature "read:migrations".',
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("Retrieving pending migrations", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["read:migrations"],
      });

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
