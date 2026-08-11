import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import activation from "models/activation";

export default createRouter<NextApiRequest, NextApiResponse>()
  .get(getHandler)
  .post(postHandler)
  .handler(controller.errorHandlers);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const users = await user.listAll();
  return res.status(200).json(users);
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);

  await activation.sendEmailToUser(newUser, activationToken);

  return res.status(201).json(newUser);
}
