import controller from "infra/controller";
import { RequestWithContext } from "infra/controller/types";
import { ForbiddenError } from "infra/errors";
import authorization from "models/authorization";
import user from "models/user";
import { CreateUserInputNoRequired } from "models/user/types";
import { NextApiResponse } from "next";
import { createRouter } from "next-connect";

export default createRouter<RequestWithContext, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:user"), getHandler)
  .patch(controller.canRequest("update:user"), patchHandler)
  .handler(controller.errorHandlers);

async function getHandler(
  request: RequestWithContext,
  response: NextApiResponse,
) {
  const userTryingToGet = request.context.user;
  const { username } = request.query as CreateUserInputNoRequired;

  const targetUser =
    username === userTryingToGet.username
      ? userTryingToGet
      : await user.findOneByUsername(username!);

  if (!authorization.can(userTryingToGet, "read:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para ler este usuário.",
      action: 'Verifique a feature "read:user" ou "read:user:others".',
    });
  }
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    targetUser,
  );
  return response.status(200).json(secureOutputValues);
}

async function patchHandler(
  request: RequestWithContext,
  response: NextApiResponse,
) {
  const userTryingToPatch = request.context.user;
  const { username } = request.query as CreateUserInputNoRequired;
  const inputInsecure = request.body;

  const targetUser =
    username === userTryingToPatch.username
      ? userTryingToPatch
      : await user.findOneByUsername(username!);

  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para ler este usuário.",
      action: 'Verifique a feature "update:user" ou "update:user:others".',
    });
  }

  const valuesFiltered = authorization.filterInput(
    userTryingToPatch,
    "update:user",
    inputInsecure,
    targetUser,
  );

  const updatedUser = await user.update(String(username), valuesFiltered);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:user",
    updatedUser,
  );

  return response.status(200).json(secureOutputValues);
}
