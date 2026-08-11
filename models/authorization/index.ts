import { AnonymousUser } from "infra/controller/types";
import { User } from "models/user/types";

export function can(
  user: User | (AnonymousUser & { id?: string }),
  feature: string, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resource: any,
) {
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

const authorization = {
  can,
};

export default authorization;
