import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, test } from "@jest/globals";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successfull)", () => {
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

    const createUserResponseBody = await createUserResponse.json();

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

  // test("Receive activation email", async () => {});

  // test("Activate account", async () => {});

  // test("Login", async () => {});

  // test("Get user information", async () => {});
});
