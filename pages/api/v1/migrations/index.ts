import controller from "infra/controller";
import { RequestWithContext } from "infra/controller/types";
import authorization from "models/authorization";
import migrator from "models/migrator";
import { NextApiResponse } from "next";
import { createRouter } from "next-connect";

export default createRouter<RequestWithContext, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:migrations"), getHandler)
  .post(postHandler)
  .handler(controller.errorHandlers);

async function getHandler(req: RequestWithContext, res: NextApiResponse) {
  const userTryingToGet = req.context.user;
  const pendingMigrations = await migrator.listPendingMigrations();
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migrations",
    pendingMigrations,
  );
  return res.status(200).json(secureOutputValues);
}

async function postHandler(req: RequestWithContext, res: NextApiResponse) {
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0) {
    return res.status(201).json(migratedMigrations);
  }

  return res.status(200).json(migratedMigrations);
}
