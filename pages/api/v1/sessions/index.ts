import controller from "infra/controller";
import { RequestWithContext } from "infra/controller/types";
import { ForbiddenError } from "infra/errors";
import authentication from "models/authentication";
import authorization from "models/authorization";
import session from "models/session";
import { NextApiResponse } from "next";
import { createRouter } from "next-connect";

export default createRouter<RequestWithContext, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest("create:session"), postHandler)
  .delete(deleteHandler)
  .handler(controller.errorHandlers);

async function postHandler(req: RequestWithContext, res: NextApiResponse) {
  const userInputValues = req.body;

  const authenticatedUser = await authentication.getUser(
    userInputValues.email,
    userInputValues.password,
  );

  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para fazer login.",
      action: "Contate o suporte caso você acredite que isto seja um engano.",
    });
  }

  const newSession = await session.create(authenticatedUser.id);

  await controller.setSessionCookie(newSession.token, res);

  const secureOutputValues = authorization.filterOutput(
    authenticatedUser,
    "read:session",
    newSession,
  );

  return res.status(201).json(secureOutputValues);
}

async function deleteHandler(req: RequestWithContext, res: NextApiResponse) {
  const userTryingToDelete = req.context.user;
  const sessionToken = req.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(res);

  const secureOutputValues = authorization.filterOutput(
    userTryingToDelete,
    "read:session",
    expiredSession,
  );

  return res.status(200).json(secureOutputValues);
}
