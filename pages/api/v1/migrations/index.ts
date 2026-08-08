import controller from "infra/controller";
import migrator from "models/migrator";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return res.status(200).json(pendingMigrations);
}
