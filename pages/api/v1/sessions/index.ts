import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as cookie from "cookie";
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

  res.setHeader(
    "Set-Cookie",
    cookie.stringifySetCookie({
      name: "session_id",
      value: newSession.token,
      path: "/",
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    }),
  );

  return res.status(201).json(newSession);
}
