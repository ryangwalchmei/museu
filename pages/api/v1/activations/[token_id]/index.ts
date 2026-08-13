import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import { NextApiResponse } from "next";
import { RequestWithContext } from "infra/controller/types";
import authorization from "models/authorization";

export default createRouter<RequestWithContext, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .patch(controller.canRequest("read:activation_token"), patchHandler)
  .handler(controller.errorHandlers);

async function patchHandler(req: RequestWithContext, res: NextApiResponse) {
  const userTryingToPatch = req.context.user;
  const { token_id } = req.query;

  const validActivationToken = await activation.findOneValidById(
    String(token_id),
  );
  await activation.activatedUserByUserId(validActivationToken.user_id);

  const usedActivationToken = await activation.markTokenAsUsed(
    String(token_id),
  );

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:activation_token",
    usedActivationToken,
  );

  return res.status(200).json(secureOutputValues);
}
