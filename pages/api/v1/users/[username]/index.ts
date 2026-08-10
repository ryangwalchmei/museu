import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import { NextApiRequest, NextApiResponse } from "next";

export default createRouter<NextApiRequest, NextApiResponse>()
  .get(getHandler)
  .patch(patchHandler)
  .handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const { username } = request.query;

  const targetUser = await user.findOneByUsername(String(username));

  return response.status(200).json(targetUser);
}

async function patchHandler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const username = request.query.username;
  const userInputValues = request.body;

  const updatedUser = await user.update(String(username), userInputValues);
  return response.status(200).json(updatedUser);
}
