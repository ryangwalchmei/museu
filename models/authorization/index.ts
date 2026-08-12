/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnonymousUser } from "infra/controller/types";
import { InternalServerError, ValidationError } from "infra/errors";
import { User } from "models/user/types";
import availableFeatures from "models/authorization/user-features";

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

function filterInput(user: User, feature: string, input: any) {
  validateUser(user);
  validateFeature(feature);
  validateInput(input);

  let filteredInputValues: any;
  let cleanedInput: any;

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

const authorization = {
  can,
  filterInput,
};

export default authorization;
