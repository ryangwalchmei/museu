import { beforeAll, describe, expect, test } from "@jest/globals";
import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/:username", () => {
  describe("Anonymous user", () => {
    test("reatriving an user", async () => {
      const userCreated = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userCreated.username}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar essa ação",
        action: 'Verifique se seu usuário possui a feature "read:user".',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Self user data", async () => {
      const { session, user } = await orchestrator.createAuthenticatedUser({
        features: ["read:user"],
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user.username,
        email: user.email,
        password: responseBody.password,
        password_changed_at: responseBody.password_changed_at,
        features: user.features,
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
        notes: user.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        avatar_url: user.avatar_url,
        banned_at: user.banned_at,
        banned_by: user.banned_by,
        banned_reason: user.banned_reason,
        deactivated_at: user.deactivated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
    test("reatriving other user", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["read:user"],
      });

      const otherUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${otherUser.username}`,
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para ler este usuário.",
        action: 'Verifique a feature "read:user" ou "read:user:others".',
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("reatriving other user", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["read:user", "read:user:others"],
      });

      const otherUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${otherUser.username}`,
        {
          headers: {
            Cookie: `session_id=${session.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        ...otherUser,
        created_at: new Date(responseBody.created_at).toISOString(),
        password_changed_at: new Date(
          responseBody.password_changed_at,
        ).toISOString(),
        updated_at: new Date(responseBody.updated_at).toISOString(),
      });
    });

    test("With an existing user", async () => {
      const { user, session } = await orchestrator.createAuthenticatedUser({
        features: ["read:user", "read:user:others"],
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          headers: {
            Cookie: `session_id=${session.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user.username,
        email: user.email,
        password: responseBody.password,
        password_changed_at: new Date(user.password_changed_at).toISOString(),
        features: [
          "create:session",
          "read:session",
          "read:user",
          "read:user:others",
        ],
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
      const { user, session } = await orchestrator.createAuthenticatedUser({
        features: ["read:user", "read:user:others"],
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          headers: {
            Cookie: `session_id=${session.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user.username,
        email: user.email,
        password: responseBody.password,
        password_changed_at: new Date(user.password_changed_at).toISOString(),
        features: [
          "create:session",
          "read:session",
          "read:user",
          "read:user:others",
        ],
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

    test("With nonexistent `username`", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["read:user", "read:user:others"],
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent",
        {
          headers: {
            Cookie: `session_id=${session.token}`,
          },
        },
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
