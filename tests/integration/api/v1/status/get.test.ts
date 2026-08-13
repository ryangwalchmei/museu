import { beforeAll, describe, expect, test } from "@jest/globals";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parseUpdated_at = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parseUpdated_at);

      expect(responseBody.dependencies.database).not.toHaveProperty("version");

      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(typeof responseBody.dependencies.database.max_connections).toBe(
        "number",
      );

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Default user", () => {
    test("Retrieving current system status", async () => {
      const { session } = await orchestrator.createAuthenticatedUser();

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parseUpdated_at = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parseUpdated_at);

      expect(responseBody.dependencies.database).not.toHaveProperty("version");

      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(typeof responseBody.dependencies.database.max_connections).toBe(
        "number",
      );

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Privileged user", () => {
    test("Retrieving current system status", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["read:status:all"],
      });

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parseUpdated_at = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parseUpdated_at);

      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(responseBody.dependencies.database.version).toBe("16.6");

      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(typeof responseBody.dependencies.database.max_connections).toBe(
        "number",
      );

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
