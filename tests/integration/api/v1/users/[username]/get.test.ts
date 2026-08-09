import { beforeAll, describe, expect, test } from "@jest/globals";
import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/:username", () => {
  describe("Privileged user", () => {
    test("With an existing user", async () => {
      const user = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user.username,
        email: user.email,
        password: responseBody.password,
        password_changed_at: new Date(user.password_changed_at).toISOString(),
        features: ["read:activation_token"],
        avatar_url: user.avatar_url,
        banned_at: user.banned_at,
        banned_by: user.banned_by,
        banned_reason: user.banned_reason,
        deactivated_at: user.deactivated_at,
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
        notes: user.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const user = await orchestrator.createUser();
      const username =
        user.username === user.username.toLowerCase()
          ? user.username.toUpperCase()
          : user.username.toLowerCase();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user.username,
        email: user.email,
        password: responseBody.password,
        password_changed_at: new Date(user.password_changed_at).toISOString(),
        features: ["read:activation_token"],
        avatar_url: user.avatar_url,
        banned_at: user.banned_at,
        banned_by: user.banned_by,
        banned_reason: user.banned_reason,
        deactivated_at: user.deactivated_at,
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
        notes: user.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent",
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
