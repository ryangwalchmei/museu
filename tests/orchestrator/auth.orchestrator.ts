import session from "models/session";
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
  const activatedUser = await activateUser(createdUser);
  const sessionObject = await createSession(activatedUser);

  let userWithSession: User;

  if (userObject?.features) {
    userWithSession = await addFeaturesToUser(
      activatedUser.id,
      userObject.features,
    );
  }

  return {
    session: sessionObject,
    user: userWithSession! ?? activatedUser,
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
