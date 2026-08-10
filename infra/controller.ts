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

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(
  error: unknown,
  _request: NextApiRequest,
  response: NextApiResponse,
): void {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof UnauthorizedError
  ) {
    response.status(error.statusCode).json(error);
    return;
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
  response.setHeader(
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

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;
