import database from "infra/database";
import password from "models/password";
import { NotFoundError, ValidationError } from "infra/errors";

import { CreateUserInput } from "./types";

async function listAll() {
  const allUsers = await runSelectAllQuery();
  return allUsers;

  async function runSelectAllQuery() {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        ORDER BY
          username ASC
        ;`,
      values: [],
    });

    return results.rows;
  }
}

async function findOneByUsername(username: CreateUserInput["username"]) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username: CreateUserInput["username"]) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues: CreateUserInput) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueCpf(userInputValues.cpf);
  await hashPasswordInObject(userInputValues);
  injectDefaultfeaturesInObject(userInputValues);

  if (!userInputValues.cpf) {
    throw new ValidationError({
      message: "CPF não foi informado ou inválido.",
      action: "Insira um CPF válido para realizar esta operação.",
    });
  }
  if (!userInputValues.phone) {
    throw new ValidationError({
      message: "Número telefone não foi informado ou inválido.",
      action: "Insira um número telefone válido para realizar esta operação.",
    });
  }

  if (!userInputValues.address) {
    throw new ValidationError({
      message: "Endereço não foi informado.",
      action: "Insira um endereço para realizar esta operação.",
    });
  }

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues: CreateUserInput) {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password, features, cpf, phone, address, notes, avatar_url)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
        userInputValues.features,
        userInputValues.cpf,
        userInputValues.phone,
        userInputValues.address,
        userInputValues.notes,
        userInputValues.avatar_url,
      ],
    });
    return results.rows[0];
  }

  function injectDefaultfeaturesInObject(userInputValues: CreateUserInput) {
    userInputValues.features = ["read:activation_token"];
  }
}

async function validateUniqueUsername(username: CreateUserInput["username"]) {
  const results = await database.query({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
    `,
    values: [username],
  });

  if (results.rows.length > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validateUniqueEmail(email: CreateUserInput["email"]) {
  const results = await database.query({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  });

  if (results.rows.length > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function validateUniqueCpf(cpf: CreateUserInput["cpf"]) {
  const results = await database.query({
    text: `
      SELECT
        cpf
      FROM
        users
      WHERE
        LOWER(cpf) = LOWER($1)
      ;`,
    values: [cpf],
  });

  if (results.rows.length > 0) {
    throw new ValidationError({
      message: "O CPF informado já está sendo utilizado.",
      action: "Utilize outro CPF para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues: CreateUserInput) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  listAll,
};

export default user;
