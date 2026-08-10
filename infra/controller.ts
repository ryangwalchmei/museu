import * as cookie from "cookie";
import {
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/errors";
import session from "models/session";
import type { NextApiRequest, NextApiResponse } from "next";

function onNoMatchHandler(
  _request: NextApiRequest,
  response: NextApiResponse,
): void {
  const publicErrorObject = new MethodNotAllowedError();

  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(
  error: unknown,
  _request: NextApiRequest,
  response: NextApiResponse,
): void {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function setSessionCookie(
  sessionToken: string,
  response: NextApiResponse,
) {
  return response.setHeader(
    "Set-Cookie",
    cookie.stringifySetCookie({
      name: "session_id",
      value: sessionToken,
      path: "/",
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    }),
  );
}

async function clearSessionCookie(response: NextApiResponse) {
  const setCookie = cookie.stringifySetCookie({
    name: "session_id",
    value: "invalid",
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  return response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
