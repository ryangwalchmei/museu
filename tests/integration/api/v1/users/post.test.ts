import { beforeAll, describe, expect, test } from "@jest/globals";
import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";
import { faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const cpf = orchestrator.cpf.generate(false);
      const avatarUrl = faker.image.avatar();
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "ryangwalchmei",
          email: "contato@gwalchmei.com.br",
          password: "senha123",
          cpf,
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
          avatar_url: avatarUrl,
        }),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "ryangwalchmei",
        email: "contato@gwalchmei.com.br",
        password: responseBody.password,
        password_changed_at: responseBody.password_changed_at,
        features: ["read:activation_token"],
        cpf: cpf,
        phone: "91984546411",
        address: "rua tal, cidade tal, estado tal, pais tal",
        notes: null,
        avatar_url: avatarUrl,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        banned_at: null,
        banned_by: null,
        banned_reason: null,
        deactivated_at: null,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("ryangwalchmei");
      const correctPasswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "SenhaErrada",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated `email`", async () => {
      const cpf = orchestrator.cpf.generate(false);
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@gwalchmei.com.br",
          password: "senha123",
          cpf,
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@gwalchmei.com.br",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated `username`", async () => {
      const cpf = orchestrator.cpf.generate(false);
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicado",
          email: "usernameduplicado1@gwalchmei.com.br",
          password: "senha123",
          cpf,
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "UsernameDuplicado",
          email: "usernameduplicado2@gwalchmei.com.br",
          password: "senha123",
          cpf,
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With invalid `username`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username inválido",
          email: faker.internet.email(),
          password: faker.internet.password(),
          cpf: cpf.generate(),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado é inválido.",
        action: "Insira um username válido para realizar esta operação.",
        status_code: 400,
      });
    });

    test("Without `CPF`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernamevalid",
          email: "emailvalid@gwalchmei.com.br",
          password: "senha123",
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "CPF não foi informado ou inválido.",
        action: "Insira um CPF válido para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated `CPF`", async () => {
      const cpfDuplicated = orchestrator.cpf.generate(false);
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username1",
          email: "email1@gwalchmei.com.br",
          password: "senha123",
          cpf: cpfDuplicated,
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username2",
          email: "email2@gwalchmei.com.br",
          password: "senha123",
          cpf: cpfDuplicated,
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O CPF informado já está sendo utilizado.",
        action: "Utilize outro CPF para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With invalid `CPF`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernamevalid",
          email: "emailvalid@gwalchmei.com.br",
          password: "senha123",
          cpf: "12345678900",
          address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O CPF informado é inválido.",
        action: "Insira um CPF válido para realizar esta operação.",
        status_code: 400,
      });
    });

    test("Without `address`", async () => {
      const cpf = orchestrator.cpf.generate(false);
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "wihoutaddress",
          email: "wihoutaddress@gwalchmei.com.br",
          password: "senha123",
          cpf,
          // address: "rua tal, cidade tal, estado tal, pais tal",
          phone: "91984546411",
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Endereço não foi informado.",
        action: "Insira um endereço para realizar esta operação.",
        status_code: 400,
      });
    });
  });
});
