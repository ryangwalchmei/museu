import { AnonymousUser } from "infra/controller/types";
import { User } from "models/user/types";

function can(user: User | AnonymousUser, feature: string) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }
  return authorized;
}

const authorization = {
  can,
};

export default authorization;
