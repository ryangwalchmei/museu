import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import { NextApiRequest, NextApiResponse } from "next";

export default createRouter<NextApiRequest, NextApiResponse>()
  .patch(patchHandler)
  .handler(controller.errorHandlers);

async function patchHandler(req: NextApiRequest, res: NextApiResponse) {
  const { token_id } = req.query;

  const validTokenObject = await activation.findOneValidById(String(token_id));
  const usedActivationToken = await activation.markTokenAsUsed(
    validTokenObject.id,
  );
  await activation.activatedUserByUserId(usedActivationToken.user_id);

  return res.status(200).json(usedActivationToken);
}
