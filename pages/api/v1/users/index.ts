import { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import activation from "models/activation";
import { RequestWithContext } from "infra/controller/types";

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
  const userInputValues = req.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser);

  await activation.sendEmailToUser(newUser, activationToken);

  return res.status(201).json(newUser);
}
