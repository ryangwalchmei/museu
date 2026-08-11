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
import user from "models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import { RequestWithContext } from "./types";

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

async function injectAnonymousOrUser(
  request: RequestWithContext,
  response: NextApiResponse,
  next: () => void,
) {
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser(request);
    return next();
  }

  await injectAnonymousUser(request);
  return next();

  async function injectAuthenticatedUser(request: RequestWithContext) {
    const sessionToken = request.cookies.session_id;
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userObject = await user.findOneById(sessionObject.user_id);

    request.context = {
      ...request.context,
      user: userObject,
    };
  }

  async function injectAnonymousUser(request: RequestWithContext) {
    const anonymousUserObject = {
      features: ["read:activation_token", "create:session", "create:user"],
    };

    request.context = {
      ...request.context,
      user: anonymousUserObject,
    };
  }
}

function canRequest(feature: string) {
  return function canRequestMiddleware(
    request: RequestWithContext,
    response: NextApiResponse,
    next: () => void,
  ) {
    const userTryingToRequest = request.context.user;

    if (userTryingToRequest.features.includes(feature)) {
      return next();
    }

    throw new ForbiddenError({
      message: "Você não possui permissão para executar essa ação",
      action: `Verifique se seu usuário possui a feature "${feature}".`,
    });
  };
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAnonymousOrUser,
  canRequest,
};

export default controller;
