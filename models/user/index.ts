import database from "infra/database";
import password from "models/password";
import { cpfValidator } from "cpf-cnpj-validator";
import { NotFoundError, ValidationError } from "infra/errors";

import { CreateUserInput, User } from "./types";

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

async function findOneById(id: string) {
  const userFound = await runSelectQuery(id);

  return userFound;

  async function runSelectQuery(id: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          id = $1
        LIMIT
          1
        ;`,
      values: [id],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O id informado não foi encontrado no sistema.",
        action: "Verifique se o id está digitado corretamente.",
      });
    }

    return results.rows[0] as User;
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

    return results.rows[0] as User;
  }
}

async function findOneByEmail(email: CreateUserInput["email"]) {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email: CreateUserInput["email"]) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado no sistema.",
        action: "Verifique se o email está digitado corretamente.",
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

  if (userInputValues.username) {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(userInputValues.username)) {
      throw new ValidationError({
        message: "O username informado é inválido.",
        action: "Insira um username válido para realizar esta operação.",
      });
    }
  }

  if (userInputValues.cpf) {
    await validateUniqueCpf(userInputValues.cpf);
    const isValid = cpfValidator.isValid(userInputValues.cpf);

    if (!isValid) {
      throw new ValidationError({
        message: "O CPF informado é inválido.",
        action: "Insira um CPF válido para realizar esta operação.",
      });
    }
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
    return results.rows[0] as User;
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
  if (!cpf) {
    throw new ValidationError({
      message: "CPF não foi informado ou inválido.",
      action: "Insira um CPF válido para realizar esta operação.",
    });
  }
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

async function update(
  username: CreateUserInput["username"],
  userInputValues: CreateUserInput,
) {
  if (!userInputValues || Object.keys(userInputValues).length === 0) {
    throw new ValidationError({
      message: "Nenhum dado foi enviado para atualização.",
      action: "Envie pelo menos um dado para atualizar o usuário.",
    });
  }

  if (userInputValues.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInputValues.email)) {
      throw new ValidationError({
        message: "O email informado é inválido.",
        action: "Insira um email válido para realizar esta operação.",
      });
    }
  }

  if (userInputValues.cpf) {
    await validateUniqueCpf(userInputValues.cpf);
    const isValid = cpfValidator.isValid(userInputValues.cpf);

    if (!isValid) {
      throw new ValidationError({
        message: "O CPF informado é inválido.",
        action: "Insira um CPF válido para realizar esta operação.",
      });
    }
  }

  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(
    userWithNewValues: CreateUserInput & { id?: string },
  ) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4::varchar,
          updated_at = timezone('utc', now()),
          password_changed_at = CASE
            WHEN password IS DISTINCT FROM $4::varchar
              THEN timezone('utc', now())
            ELSE password_changed_at
          END,
          cpf = $5,
          phone = $6,
          address = $7,
          notes = $8
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
        userWithNewValues.cpf,
        userWithNewValues.phone,
        userWithNewValues.address,
        userWithNewValues.notes,
      ],
    });

    return results.rows[0];
  }
}

async function setFeatures(userId: string, features: string[]) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId: string, features: string[]) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          features = $2,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [userId, features],
    });

    return results.rows[0] as User;
  }
}

async function addFeatures(userId: string, features: string[]) {
  const currentUser = await findOneById(userId);
  const updatedUser = await runUpdateQuery(currentUser.id, features);
  return updatedUser;

  async function runUpdateQuery(userId: string, features: string[]) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          features = array_cat(features, $2),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [userId, features],
    });

    return results.rows[0] as User;
  }
}

const user = {
  create,
  findOneById,
  findOneByUsername,
  findOneByEmail,
  listAll,
  update,
  setFeatures,
  addFeatures,
};

export default user;
