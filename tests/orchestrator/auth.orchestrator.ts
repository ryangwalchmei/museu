import session from "models/session";
// import orchestratoUser from "tests/orchestrator/domains/users.orchestrator";
import orch from "tests/orchestrator";
import { User, CreateUserInputNoRequired } from "models/user/types";
import user from "models/user";

async function createSession(userObject: User) {
  return await session.create(userObject.id);
}

async function activateUser(inactiveUser: User) {
  return await user.setFeatures(inactiveUser.id, [
    "create:session",
    "read:session",
  ]);
}

async function createAuthenticatedUser(userObject?: CreateUserInputNoRequired) {
  const createdUser = await orch.createUser(userObject);

  const sessionObject = await createSession(createdUser);

  return {
    session: sessionObject,
    user: createdUser,
  };
}
async function addFeaturesToUser(userId: string, features: string[]) {
  return await user.addFeatures(userId, features);
}

const orchestrator = {
  createSession,
  createAuthenticatedUser,
  activateUser,
  addFeaturesToUser,
};

export default orchestrator;
