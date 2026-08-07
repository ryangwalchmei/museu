import { runner } from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { RunnerOption } from "node-pg-migrate";

const defaultMigrationOptions: RunnerOption = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
  databaseUrl: String(process.env.DATABASE_URL),
};

async function listPendingMigrations() {
  let dbClient: Awaited<ReturnType<typeof database.getNewClient>> | undefined;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await runner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient: Awaited<ReturnType<typeof database.getNewClient>> | undefined;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await runner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
