import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import { NextApiResponse } from "next";
import { RequestWithContext } from "infra/controller/types";
import { CreateUserInputNoRequired } from "models/user/types";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors";

export default createRouter<RequestWithContext, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:user"), getHandler)
  .patch(patchHandler)
  .handler(controller.errorHandlers);

async function getHandler(
  request: RequestWithContext,
  response: NextApiResponse,
) {
  const userLogged = request.context.user;
  const { username } = request.query as CreateUserInputNoRequired;

  const targetUser =
    username === userLogged.username
      ? userLogged
      : await user.findOneByUsername(username!);

  if (!authorization.can(userLogged, "read:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para ler este usuário.",
      action: 'Verifique a feature "read:user" ou "read:user:others".',
    });
  }
  return response.status(200).json(targetUser);
}

async function patchHandler(
  request: RequestWithContext,
  response: NextApiResponse,
) {
  const username = request.query.username;
  const userInputValues = request.body;

  const updatedUser = await user.update(String(username), userInputValues);
  return response.status(200).json(updatedUser);
}
