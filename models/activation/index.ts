import database from "infra/database";
import email from "infra/email";
import webserver from "infra/webserver";
import { ActivationToken } from "./types";
import { ForbiddenError, NotFoundError } from "infra/errors";
import user from "models/user";
import authorization from "models/authorization";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000;

async function findOneValidById(validationTokenId: string) {
  const token = await runSelectQuery(validationTokenId);
  return token;

  async function runSelectQuery(validationTokenId: string) {
    const results = await database.query({
      text: `
      SELECT
        * 
      FROM 
        user_activation_tokens 
      WHERE 
        id = $1
        AND expires_at > NOW()
        AND use_at IS NULL
      LIMIT
        1
      ;`,
      values: [validationTokenId],
    });

    if (results.rowCount == 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function create(userId: string) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId: string, expiresAt: Date) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });
    return results.rows[0] as ActivationToken;
  }
}

async function sendEmailToUser(
  user: { username: string; email: string },
  activationToken: ActivationToken,
) {
  await email.send({
    from: "Gwalchmei <contato@gwalchmei.com.br>",
    to: user.email,
    subject: "Ative seu cadastro!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no Trainerfit.

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe Trainerfit`,
  });
}

async function markTokenAsUsed(tokenId: string) {
  const token = await runUpdateQuery(tokenId);
  return token;

  async function runUpdateQuery(tokenId: string) {
    const tokenUpdateResults = await database.query({
      text: `
       UPDATE 
          user_activation_tokens 
        SET
          use_at = timezone('utc', NOW()),
          updated_at = timezone('utc', NOW())
        WHERE
          id = $1
        RETURNING 
          *
      ;`,
      values: [tokenId],
    });
    return tokenUpdateResults.rows[0];
  }
}

async function activatedUserByUserId(userId: string) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativaçãos.",
      action: "Entre em contato com o suporte.",
    });
  }
  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
  ]);

  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidById,
  activatedUserByUserId,
  markTokenAsUsed,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
