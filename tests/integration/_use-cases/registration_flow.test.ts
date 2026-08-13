import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, test } from "@jest/globals";
import webserver from "infra/webserver";
import activation from "models/activation";
import user from "models/user";
import { User, UserSecureOutputProps } from "models/user/types";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow", () => {
  describe("Standard flow", () => {
    let createUserResponseBody: UserSecureOutputProps;
    let activationTokenId: string;
    let tokenSessionId: string;

    test("Create user account", async () => {
      const cpf = orchestrator.cpf.generate(false);
      const avatarUrl = faker.image.avatar();
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "RegistrationFlow",
            email: "registration.flow@gwalchmei.com.br",
            password: "RegistrationFlowPassword",
            cpf,
            address: "rua tal, cidade tal, estado tal, pais tal",
            phone: "91984546411",
            avatar_url: avatarUrl,
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      createUserResponseBody =
        (await createUserResponse.json()) as UserSecureOutputProps;

      expect(createUserResponseBody).toEqual({
        id: createUserResponseBody.id,
        username: "RegistrationFlow",
        features: ["read:activation_token"],
        created_at: createUserResponseBody.created_at,
        updated_at: createUserResponseBody.updated_at,
        address: "rua tal, cidade tal, estado tal, pais tal",
        notes: null,
        avatar_url: avatarUrl,
        phone: "91984546411",
      });
    });

    test("Receive activation email", async () => {
      const lastEmail = await orchestrator.getLastEmail();

      expect(lastEmail.sender).toBe("<contato@gwalchmei.com.br>");
      expect(lastEmail.recipients[0]).toBe(
        "<registration.flow@gwalchmei.com.br>",
      );
      expect(lastEmail.subject).toBe("Ative seu cadastro!");
      expect(lastEmail.text).toContain("RegistrationFlow");

      activationTokenId = orchestrator.extractUUID(lastEmail.text)!;

      expect(lastEmail.text).toContain(
        `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
      );

      const activationTokenObject = await activation.findOneValidById(
        activationTokenId!,
      );

      expect(activationTokenObject.user_id).toBe(createUserResponseBody.id);
      expect(activationTokenObject.use_at).toBe(null);
    });

    test("Activate account", async () => {
      const activationResponse = await fetch(
        `${webserver.origin}/api/v1/activations/${activationTokenId}`,
        {
          method: "PATCH",
        },
      );

      expect(activationResponse.status).toBe(200);

      const activationResponseBody = await activationResponse.json();
      expect(Date.parse(activationResponseBody.use_at)).not.toBeNaN();

      const activatedUser = await user.findOneByUsername("RegistrationFlow");
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
      ]);
    });

    test("Login", async () => {
      const createSessionResponse = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "registration.flow@gwalchmei.com.br",
            password: "RegistrationFlowPassword",
          }),
        },
      );

      expect(createSessionResponse.status).toBe(201);

      const createSessionResponseBody = await createSessionResponse.json();
      tokenSessionId = createSessionResponseBody.token;

      expect(createSessionResponseBody.user_id).toBe(createUserResponseBody.id);
    });

    test("Get user information", async () => {
      const userResponse = await fetch(`http://localhost:3000/api/v1/user/`, {
        headers: {
          Cookie: `session_id=${tokenSessionId}`,
        },
      });

      expect(userResponse.status).toBe(200);
      const userResponseBody = await userResponse.json();

      expect(userResponseBody.id).toBe(createUserResponseBody.id);
    });
  });

  describe("Inactive user attempting to create a session", () => {
    test("Create user account", async () => {
      const cpf = orchestrator.cpf.generate(false);
      const avatarUrl = faker.image.avatar();
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "sem_ativar",
            email: "sem.ativar@gwalchmei.com.br",
            password: "RegistrationFlowPassword",
            cpf,
            address: "rua tal, cidade tal, estado tal, pais tal",
            phone: "91984546411",
            avatar_url: avatarUrl,
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);
    });

    test("Login", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "sem.ativar@gwalchmei.com.br",
          password: "RegistrationFlowPassword",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Contate o suporte caso você acredite que isto seja um engano.",
        message: "Você não possui permissão para fazer login.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("User already activated attempting to use the same token again.", () => {
    let createUserResponseBody: User;
    let activationTokenId: string;

    test("Create user account", async () => {
      const cpf = orchestrator.cpf.generate(false);
      const avatarUrl = faker.image.avatar();
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "activation_again",
            email: "activation.again@gwalchmei.com.br",
            password: "RegistrationFlowPassword",
            cpf,
            address: "rua tal, cidade tal, estado tal, pais tal",
            phone: "91984546411",
            avatar_url: avatarUrl,
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      createUserResponseBody = (await createUserResponse.json()) as User;
    });

    test("Receive activation email", async () => {
      const lastEmail = await orchestrator.getLastEmail();

      expect(lastEmail.sender).toBe("<contato@gwalchmei.com.br>");
      expect(lastEmail.recipients[0]).toBe(
        "<activation.again@gwalchmei.com.br>",
      );
      expect(lastEmail.subject).toBe("Ative seu cadastro!");
      expect(lastEmail.text).toContain("activation_again");

      activationTokenId = orchestrator.extractUUID(lastEmail.text)!;

      expect(lastEmail.text).toContain(
        `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
      );

      const activationTokenObject = await activation.findOneValidById(
        activationTokenId!,
      );

      expect(activationTokenObject.user_id).toBe(createUserResponseBody.id);
      expect(activationTokenObject.use_at).toBe(null);
    });

    test("Activate account for first time", async () => {
      const activationResponse = await fetch(
        `${webserver.origin}/api/v1/activations/${activationTokenId}`,
        {
          method: "PATCH",
        },
      );

      expect(activationResponse.status).toBe(200);

      const activationResponseBody = await activationResponse.json();
      expect(Date.parse(activationResponseBody.use_at)).not.toBeNaN();

      const activatedUser = await user.findOneByUsername("RegistrationFlow");
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
      ]);
    });

    test("Activate account for secound time", async () => {
      const activationResponse = await fetch(
        `${webserver.origin}/api/v1/activations/${activationTokenId}`,
        {
          method: "PATCH",
        },
      );

      expect(activationResponse.status).toBe(404);
    });
  });
});
