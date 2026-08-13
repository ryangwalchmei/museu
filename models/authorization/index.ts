/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnonymousUser } from "infra/controller/types";
import { InternalServerError, ValidationError } from "infra/errors";
import availableFeatures from "models/authorization/user-features";
import { Migration } from "models/migrator/types";
import {
  CreateUserInput,
  User,
  UserSecureOutputProps,
} from "models/user/types";

export function can(
  user: User | (AnonymousUser & { id?: string }),
  feature: string,
  resource?: any,
) {
  validateUser(user);
  validateFeature(feature);

  const [action, entity] = feature.split(":");

  if (!user.features.includes(feature)) {
    return false;
  }

  if (!resource) return true;

  const resourceOwnerId = resource.user_id || resource.owner_id || resource.id;

  if (resourceOwnerId && user.id === resourceOwnerId) {
    return true;
  }

  const othersFeature = `${action}:${entity}:others`;

  if (user.features.includes(othersFeature)) {
    return true;
  }

  return false;
}

function filterInput(
  user: User | AnonymousUser,
  feature: string,
  input: any,
  target?: any,
) {
  validateUser(user);
  validateFeature(feature);
  validateInput(input);

  let filteredInputValues: any = {};
  const cleanedInput: any = {};

  if (feature === "create:user" && can(user, feature, target)) {
    const userInput: CreateUserInput = input;
    filteredInputValues = {
      username: userInput?.username,
      email: userInput?.email,
      password: userInput?.password,
      cpf: userInput?.cpf,
      phone: userInput?.phone,
      address: userInput.address,
      notes: userInput?.notes,
      features: userInput?.features,
      avatar_url: userInput?.avatar_url,
    };
  }

  for (const key in filteredInputValues) {
    if (filteredInputValues[key] !== undefined) {
      cleanedInput[key] = filteredInputValues[key];
    }
  }

  return cleanedInput;

  function validateInput(input: any) {
    let countInputFields = 0;
    for (const key in input) {
      if (input[key] !== undefined) countInputFields++;
    }

    if (!input || countInputFields === 0) {
      throw new ValidationError({
        message: `Nenhum "input" foi especificado para a ação de filtro.`,
        action: `Contate o suporte informando o campo "errorId".`,
      });
    }
  }
}

function filterOutput(
  user: User | (AnonymousUser & { id?: string }),
  feature: string,
  resource: any,
) {
  validateUser(user);
  validateFeature(feature);
  validateResource(resource);

  if (feature == "read:user") {
    const user: UserSecureOutputProps = resource;
    return {
      id: user.id,
      username: user.username,
      features: user.features,
      created_at: user.created_at,
      updated_at: user.updated_at,
      address: user.address,
      notes: user.notes,
      phone: user.phone,
      avatar_url: user.avatar_url,
      password_changed_at: user.password_changed_at,
    };
  }

  if (feature == "read:user:self") {
    if (user.id === resource.id) {
      return {
        id: resource.id,
        username: resource.username,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
        address: resource.address,
        avatar_url: resource.avatar_url,
        notes: resource.notes,
        password_changed_at: resource.password_changed_at,
        phone: resource.phone,
      };
    }
  }

  if (feature == "read:status:all") {
    const values = {
      updated_at: resource.updated_at,
      dependencies: {
        database: {
          max_connections: resource.dependencies.database.max_connections,
          opened_connections: resource.dependencies.database.opened_connections,
          version: undefined,
        },
      },
    };

    if (can(user, feature)) {
      values.dependencies.database.version =
        resource.dependencies.database.version;
    }

    return values;
  }

  if (feature == "read:session") {
    if (user.id === resource.user_id) {
      return {
        id: resource.id,
        token: resource.token,
        user_id: resource.user_id,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
        expires_at: resource.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: resource.id,
      use_at: resource.use_at,
      user_id: resource.user_id,
      expires_at: resource.expires_at,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === "read:migrations") {
    return resource.map((migration: Migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    }) as Migration[];
  }
}

function validateUser(user: User | (AnonymousUser & { id?: string })) {
  if (!user) {
    const validationError = new ValidationError({
      message: `Nenhum "user" foi especificado para a ação de autorização.`,
      action: `Contate o suporte.`,
    });
    throw new InternalServerError({
      cause: validationError,
    });
  }

  if (!user.features || !Array.isArray(user.features)) {
    const validationError = new ValidationError({
      message: `"user" não possui "features" ou não é um array.`,
      action: `Contate o suporte.`,
    });

    throw new InternalServerError({
      cause: validationError,
    });
  }
}

function validateFeature(feature: string) {
  if (!feature) {
    const validationError = new ValidationError({
      message: `Nenhuma "feature" foi especificada para a ação de autorização.`,
      action: `Contate o suporte.`,
    });

    throw new InternalServerError({
      cause: validationError,
    });
  }

  if (!availableFeatures.has(feature)) {
    const validationError = new ValidationError({
      message: `A feature '${feature}' não está disponível na lista de features existentes.`,
      action: `Contate o suporte.`,
    });

    throw new InternalServerError({
      cause: validationError,
    });
  }
}

function validateResource(resource: any) {
  if (!resource) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer um `resource` em `authorization.filterOutput()`.",
    });
  }
}

const authorization = {
  can,
  filterInput,
  filterOutput,
};

export default authorization;
