import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";

export default createRouter<NextApiRequest, NextApiResponse>()
  .post(postHandler)
  .handler(controller.errorHandlers);

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  await controller.setSessionCookie(newSession.token, res);

  return res.status(201).json(newSession);
}
