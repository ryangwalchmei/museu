import { faker, fakerPT_BR } from "@faker-js/faker";
import { beforeAll, describe, expect, test } from "@jest/globals";
import { cpf } from "cpf-cnpj-validator";
import password from "models/password";
import user from "models/user";
import orchestrator from "tests/orchestrator/";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/:username", () => {
  describe("Anonymous user", () => {
    test("Trying change any user's data", async () => {
      const createdUser = await orchestrator.createUser();
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "newusernamecustomer",
            email: "newemail@gwalchmei.com.br",
            password: "newpassword",
            cpf: cpf.generate(false),
            phone: "12345678901",
            address: "Rua tal, cidade Tal",
            notes: "lorem ipsum",
          }),
        },
      );
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar essa ação",
        action: 'Verifique se seu usuário possui a feature "update:user".',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Change user self data", async () => {
      const { session, user: createdUser } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user"],
        });

      const phone = fakerPT_BR.phone.number({ style: "national" });
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({
            username: "newusername",
            email: "newemail@gwalchmei.com.br",
            password: "newpassword",
            phone,
            address: "Rua tal, cidade Tal",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newusername",
        phone: phone,
        address: "Rua tal, cidade Tal",
        notes: null,
        features: ["create:session", "read:session", "update:user"],
        avatar_url: createdUser.avatar_url,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        password_changed_at: responseBody.password_changed_at,
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
      const { session, user: createdUser } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user"],
        });
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Nenhum dado foi enviado para atualização.",
        action: "Preencha os campos requeridos e tente novamente.",
        status_code: 400,
      });
    });

    test("With nonexistent `username`", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["update:user"],
      });
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${session.token}`,
          },
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

    test("With duplicated `username`", async () => {
      const { session, user: createdUser1 } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user"],
        });

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
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

    test("With duplicated `email`", async () => {
      const { session, user: createdUser1 } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user"],
        });

      await orchestrator.createUser({
        email: "email2@gwalchmei.com.br",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
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

    test("With invalid `email`", async () => {
      const { session, user: createdUser1 } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user"],
        });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
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

    test("With unique `username`", async () => {
      const { session, user } = await orchestrator.createAuthenticatedUser({
        features: ["update:user"],
      });
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
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
        features: ["create:session", "read:session", "update:user"],
        phone: user.phone,
        address: user.address,
        notes: user.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        password_changed_at: responseBody.password_changed_at,
        avatar_url: user.avatar_url,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique `email`", async () => {
      const { session, user: createdUser } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user"],
        });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,

        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
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
        features: ["create:session", "read:session", "update:user"],
        phone: createdUser.phone,
        address: createdUser.address,
        notes: createdUser.notes,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        avatar_url: createdUser.avatar_url,
        password_changed_at: new Date(
          createdUser.password_changed_at,
        ).toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      const userInDatabase = await user.findOneByUsername(createdUser.username);

      expect(userInDatabase.email).toBe("uniqueEmail2@gwalchmei.com.br");
    });

    test("With new `password`", async () => {
      const { session, user: createdUser } =
        await orchestrator.createAuthenticatedUser({
          password: "newPassword1",
          features: ["update:user"],
        });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

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

      expect(responseBody.password).not.toBe(createdUser.password);
      expect(
        Date.parse(new Date(createdUser.password_changed_at).toISOString()) <
          Date.parse(responseBody.password_changed_at),
      ).toBe(true);
    });

    test("Change other user data", async () => {
      const { session } = await orchestrator.createAuthenticatedUser({
        features: ["update:user"],
      });

      const otherUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${otherUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({
            username: "otherUserToChange",
            email: "otherUserToChange@gwalchmei.com.br",
            password: "newpassword",
          }),
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: 'Verifique a feature "update:user" ou "update:user:others".',
        message: "Você não possui permissão para ler este usuário.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });

    test("With disallowed field", async () => {
      const { session, user: createdUser } =
        await orchestrator.createAuthenticatedUser({
          cpf: cpf.generate(),
          features: ["update:user"],
        });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
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
        message: "Nenhum dado foi enviado para atualização.",
        action: "Envie pelo menos um dado para atualizar o usuário.",
        status_code: 400,
      });

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      expect(userInDatabase.cpf === createdUser.cpf);
    });
  });

  describe("Priviliged user", () => {
    test("Change user self data", async () => {
      const { session, user: createdUser } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user", "update:user:others"],
          username: "username",
        });
      const newCpf = cpf.generate(false);
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({
            username: "newusernameupdated",
            email: "newemailUserAdmin@gwalchmei.com.br",
            password: "newpassword",
            cpf: newCpf,
            phone: "12345678901",
            address: "Rua tal, cidade Tal",
            notes: "lorem ipsum",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newusernameupdated",
        phone: "12345678901",
        address: "Rua tal, cidade Tal",
        notes: "lorem ipsum",
        features: [
          "create:session",
          "read:session",
          "update:user",
          "update:user:others",
        ],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        avatar_url: createdUser.avatar_url,
        password_changed_at: new Date(
          responseBody.password_changed_at,
        ).toISOString(),
      });

      expect(responseBody.cpf != createdUser.cpf).toBe(true);

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newusernameupdated");
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

      expect(userInDatabase.cpf === createdUser.cpf).toBe(false);
      expect(userInDatabase.cpf === newCpf).toBe(true);
    });

    test("With duplicated `cpf`", async () => {
      const { session, user: createdUser1 } =
        await orchestrator.createAuthenticatedUser({
          cpf: cpf.generate(),
          features: ["update:user", "update:user:others"],
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
            Cookie: `session_id=${session.token}`,
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

    test("With invalid `cpf`", async () => {
      const { session, user: createdUser } =
        await orchestrator.createAuthenticatedUser({
          cpf: cpf.generate(),
          features: ["update:user", "update:user:others"],
        });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
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

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      expect(userInDatabase.cpf == createdUser.cpf).toBe(true);
    });

    test("Change other user data", async () => {
      const { session, user: userCreated } =
        await orchestrator.createAuthenticatedUser({
          features: ["update:user", "update:user:others"],
        });

      const otherUser = await orchestrator.createUser();
      const newCPF = cpf.generate();
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${otherUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({
            username: "otherUserToChange",
            email: "otherUserToChange@gwalchmei.com.br",
            password: "newpassword",
            cpf: newCPF,
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "otherUserToChange",
        phone: otherUser.phone,
        address: otherUser.address,
        notes: otherUser.notes,
        features: ["read:activation_token"],
        created_at: new Date(otherUser.created_at).toISOString(),
        updated_at: responseBody.updated_at,
        avatar_url: otherUser.avatar_url,
        password_changed_at: new Date(
          responseBody.password_changed_at,
        ).toISOString(),
      });

      expect(responseBody.username != otherUser.username).toBe(true);

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        responseBody.username,
      );

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
      expect(
        userInDatabase.password_changed_at > userCreated.password_changed_at,
      ).toBe(true);

      expect(userInDatabase.cpf === otherUser.cpf).toBe(false);
      expect(userInDatabase.cpf === newCPF).toBe(true);
    });
  });
});
