import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import { emailHttpUrl } from "./email.orchestrator";

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }

  async function waitForEmailServer() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}
const orchestrator = {
  waitForAllServices,
  runPendingMigrations,
  clearDatabase,
};

export default orchestrator;
