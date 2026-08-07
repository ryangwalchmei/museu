import { Client, QueryConfig, QueryResult, QueryResultRow } from "pg";
import { ServiceError } from "./errors";

async function query<T extends QueryResultRow>(
  query: string | QueryConfig,
): Promise<QueryResult<T>> {
  const client = await getNewClient();

  try {
    return await client.query<T>(query);
  } catch (error) {
    throw new ServiceError({
      message: "Erro na conexão com Banco ou na Query.",
      cause: error,
    });
  } finally {
    await client.end();
  }
}

async function getNewClient(): Promise<Client> {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();

  return client;
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === "production";
}

const database = {
  query,
  getNewClient,
};

export default database;
