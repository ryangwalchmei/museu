import controller from "infra/controller";
import { RequestWithContext } from "infra/controller/types";
import activation from "models/activation";
import authorization from "models/authorization";
import user from "models/user";
import { NextApiResponse } from "next";
import { createRouter } from "next-connect";

export default createRouter<RequestWithContext, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .post(controller.canRequest("create:user"), postHandler)
  .handler(controller.errorHandlers);

async function getHandler(req: RequestWithContext, res: NextApiResponse) {
  const users = await user.listAll();
  return res.status(200).json(users);
}

async function postHandler(req: RequestWithContext, res: NextApiResponse) {
  const userTryingToPost = req.context.user;
  const inputInsecure = req.body;

  const valuesFiltered = authorization.filterInput(
    userTryingToPost,
    "create:user",
    inputInsecure,
  );
  const newUser = await user.create(valuesFiltered);

  const activationToken = await activation.create(newUser);

  await activation.sendEmailToUser(newUser, activationToken);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    newUser,
  );

  return res.status(201).json(secureOutputValues);
}
