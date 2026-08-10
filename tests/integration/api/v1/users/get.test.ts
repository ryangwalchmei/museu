import { beforeAll, describe, expect, test } from "@jest/globals";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("Privileged user", () => {
  test("Should be able to read all users", async () => {
    const createdUser1 = await orchestrator.createUser();
    const createdUser2 = await orchestrator.createUser();

    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toHaveLength(2);

    const users = [createdUser1, createdUser2].map((user) => ({
      ...user,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      password_changed_at: user.password_changed_at.toISOString(),
    }));

    expect(responseBody).toEqual(expect.arrayContaining(users));
  });
});
