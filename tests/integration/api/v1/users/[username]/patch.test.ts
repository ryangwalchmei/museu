import { beforeAll, describe, expect, test } from "@jest/globals";
import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator/";
import user from "models/user";
import password from "models/password";
import { cpf } from "cpf-cnpj-validator";
import { faker, fakerPT_BR } from "@faker-js/faker";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/:username", () => {
  describe("Default user", () => {
    test("Change user self data", async () => {
      const createdUser = await orchestrator.createUser();
      const phone = fakerPT_BR.phone.number({ style: "national" });
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "newusername",
            email: "newemail@gwalchmei.com.br",
            password: "newpassword",
            cpf: cpf.generate(),
            phone,
            address: "Rua tal, cidade Tal",
            notes: "lorem ipsum",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newusername",
        email: "newemail@gwalchmei.com.br",
        password: responseBody.password,
        password_changed_at: responseBody.password_changed_at,
        cpf: responseBody.cpf,
        phone: phone,
        address: "Rua tal, cidade Tal",
        notes: "lorem ipsum",
        features: ["read:activation_token"],
        avatar_url: createdUser.avatar_url,
        banned_at: createdUser.banned_at,
        banned_by: createdUser.banned_by,
        banned_reason: createdUser.banned_reason,
        deactivated_at: createdUser.deactivated_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.cpf != createdUser.cpf).toBe(true);

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newusername");
      const correctPasswordMatch = await password.compare(
        "newpassword",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With body empty", async () => {
      const createdUser = await orchestrator.createUser();
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Nenhum dado foi enviado para atualização.",
        action: "Envie pelo menos um dado para atualizar o usuário.",
        status_code: 400,
      });
    });

    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          body: JSON.stringify({
            note: "lorem ipsum",
          }),
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

    test("With duplicated 'username'", async () => {
      const createdUser1 = await orchestrator.createUser();

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user2",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const createdUser1 = await orchestrator.createUser();

      await orchestrator.createUser({
        email: "email2@gwalchmei.com.br",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email2@gwalchmei.com.br",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With invalid 'email'", async () => {
      const createdUser1 = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: faker.internet.ipv4(),
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Insira um email válido para realizar esta operação.",
        message: "O email informado é inválido.",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: createdUser.email,
        password: responseBody.password,
        password_changed_at: responseBody.password_changed_at,
        features: ["read:activation_token"],
        cpf: createdUser.cpf,
        phone: createdUser.phone,
        address: createdUser.address,
        notes: createdUser.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        avatar_url: createdUser.avatar_url,
        banned_at: createdUser.banned_at,
        banned_by: createdUser.banned_by,
        banned_reason: createdUser.banned_reason,
        deactivated_at: createdUser.deactivated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,

        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gwalchmei.com.br",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: "uniqueEmail2@gwalchmei.com.br",
        password: responseBody.password,
        password_changed_at: responseBody.password_changed_at,
        features: ["read:activation_token"],
        cpf: createdUser.cpf,
        phone: createdUser.phone,
        address: createdUser.address,
        notes: createdUser.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        avatar_url: createdUser.avatar_url,
        banned_at: createdUser.banned_at,
        banned_by: createdUser.banned_by,
        banned_reason: createdUser.banned_reason,
        deactivated_at: createdUser.deactivated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        password_changed_at: responseBody.password_changed_at,
        features: ["read:activation_token"],
        cpf: createdUser.cpf,
        phone: createdUser.phone,
        address: createdUser.address,
        notes: createdUser.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        avatar_url: createdUser.avatar_url,
        banned_at: createdUser.banned_at,
        banned_by: createdUser.banned_by,
        banned_reason: createdUser.banned_reason,
        deactivated_at: createdUser.deactivated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'cpf'", async () => {
      const createdUser1 = await orchestrator.createUser({
        cpf: cpf.generate(),
      });

      const createdUser2 = await orchestrator.createUser({
        cpf: cpf.generate(),
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cpf: createdUser2.cpf,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro CPF para realizar esta operação.",
        message: "O CPF informado já está sendo utilizado.",
        status_code: 400,
      });
    });

    test("With invalid 'cpf'", async () => {
      const createdUser = await orchestrator.createUser({
        cpf: cpf.generate(),
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cpf: "123.456.789-00",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Insira um CPF válido para realizar esta operação.",
        message: "O CPF informado é inválido.",
        status_code: 400,
      });
    });
  });
});
