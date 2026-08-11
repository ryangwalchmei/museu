import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, test } from "@jest/globals";
import webserver from "infra/webserver";
import activation from "models/activation";
import user from "models/user";
import { User } from "models/user/types";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successfull)", () => {
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

    createUserResponseBody = (await createUserResponse.json()) as User;

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@gwalchmei.com.br",
      password: createUserResponseBody.password,
      password_changed_at: createUserResponseBody.password_changed_at,
      features: ["read:activation_token"],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
      address: "rua tal, cidade tal, estado tal, pais tal",
      notes: null,
      avatar_url: avatarUrl,
      cpf,
      phone: "91984546411",
      banned_at: null,
      banned_by: null,
      banned_reason: null,
      deactivated_at: null,
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
    expect(activatedUser.features).toEqual(["create:session"]);
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

    expect(createSessionResponseBody.user_id).toBe(createUserResponseBody.id);
  });

  // test("Get user information", async () => {});
});
