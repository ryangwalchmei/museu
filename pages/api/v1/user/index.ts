import { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import session from "models/session";
import authorization from "models/authorization";
import { RequestWithContext } from "infra/controller/types";
import { ForbiddenError } from "infra/errors";

export default createRouter<RequestWithContext, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:session"), getHandler)
  .handler(controller.errorHandlers);

async function getHandler(req: RequestWithContext, res: NextApiResponse) {
  if (!authorization.can(req.context.user, "read:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para acessar esse recurso.",
      action: "Contate o suporte caso você acredite que isto seja um erro.",
    });
  }
  const sessionToken = req.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSessionObject.token, res);

  const userFound = await user.findOneById(sessionObject.user_id);

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return res.status(200).json(userFound);
}
