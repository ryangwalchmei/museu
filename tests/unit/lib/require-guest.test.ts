import { afterEach, describe, expect, jest, test } from "@jest/globals";
import type { GetServerSidePropsContext } from "next";
import { ServiceError, UnauthorizedError } from "infra/errors";
import requireGuest from "lib/require-guest";
import session from "models/session";

function createContext(token?: string) {
  const setHeader = jest.fn();
  const context = {
    req: { cookies: token === undefined ? {} : { session_id: token } },
    res: { setHeader },
  } as unknown as GetServerSidePropsContext;

  return { context, setHeader };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Guest-only pages", () => {
  test("allows anonymous visitors without consulting the database", async () => {
    const lookup = jest.spyOn(session, "findOneValidByToken");
    const { context, setHeader } = createContext();

    await expect(requireGuest(context)).resolves.toEqual({ props: {} });
    expect(lookup).not.toHaveBeenCalled();
    expect(setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "private, no-store, max-age=0",
    );
  });

  test("redirects valid sessions without exposing session data", async () => {
    const lookup = jest
      .spyOn(session, "findOneValidByToken")
      .mockResolvedValue({ token: "valid-session" });
    const { context, setHeader } = createContext("valid-session");

    await expect(requireGuest(context)).resolves.toEqual({
      redirect: { destination: "/", permanent: false },
    });
    expect(lookup).toHaveBeenCalledWith("valid-session");
    expect(setHeader).not.toHaveBeenCalledWith("Set-Cookie", expect.anything());
  });

  test.each(["expired-session", "unknown-session"])(
    "clears %s and allows access",
    async (token) => {
      jest
        .spyOn(session, "findOneValidByToken")
        .mockRejectedValue(new UnauthorizedError());
      const { context, setHeader } = createContext(token);

      await expect(requireGuest(context)).resolves.toEqual({ props: {} });
      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("session_id=invalid"),
      );
      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("Max-Age=-1"),
      );
    },
  );

  test("does not treat a database failure as an anonymous session", async () => {
    const failure = new ServiceError();
    jest.spyOn(session, "findOneValidByToken").mockRejectedValue(failure);
    const { context, setHeader } = createContext("existing-session");

    await expect(requireGuest(context)).rejects.toBe(failure);
    expect(setHeader).not.toHaveBeenCalledWith("Set-Cookie", expect.anything());
  });
});
