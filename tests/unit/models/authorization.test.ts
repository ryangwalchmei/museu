import { describe, expect, test } from "@jest/globals";
import { AnonymousUser } from "infra/controller/types";

import { InternalServerError } from "infra/errors";
import authorization from "models/authorization";
import { User } from "models/user/types";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without `user`", () => {
      expect(() => {
        // @ts-expect-error This test cannot have arguments.
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures",
      };

      expect(() => {
        // @ts-expect-error This test needs to have incomplete necessary arguments.
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknow `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknow:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid user and know `feature`", () => {
      const createdUser = {
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });
  describe(".filterOutput()", () => {
    test("without `user`", () => {
      expect(() => {
        // @ts-expect-error This test cannot have arguments.
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures",
      };

      expect(() => {
        // @ts-expect-error This test needs to have incomplete necessary arguments.
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknow `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        // @ts-expect-error This test needs to have incomplete necessary arguments.
        authorization.filterOutput(createdUser, "unknow:feature");
      }).toThrow(InternalServerError);
    });

    test("with know `user`, know `feature` but no `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };

      expect(() => {
        // @ts-expect-error This test needs to have incomplete necessary arguments.
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });

    test("with valid user, know `feature` and `resource`", () => {
      const createdUser: User | (AnonymousUser & { id?: string }) = {
        features: ["create:user"],
      };
      const resource = {
        id: "29f359f0-01f2-45ad-bf62-5b80230a7bcc",
        username: "resource",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        email: "resource@resource.com",
        password: "resourcepass",
      };

      const results = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );
      expect(results).toEqual({
        id: "29f359f0-01f2-45ad-bf62-5b80230a7bcc",
        username: "resource",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      });
    });
  });
});
