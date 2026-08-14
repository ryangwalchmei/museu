import { beforeAll, describe, expect, test } from "@jest/globals";
import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Should not access", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(403);
    });
  });

  describe("Default user", () => {
    test("Should not access", async () => {
      const { session } = await orchestrator.createAuthenticatedUser();

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
      });

      expect(response.status).toBe(403);
    });
  });

  describe("Privileged user", () => {
    test("Running pending migrations", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["create:migrations"],
      });

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_id=${session.token}`,
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
