import session from "models/session";
// import orchestratoUser from "tests/orchestrator/domains/users.orchestrator";
import orch from "tests/orchestrator";
import { User, CreateUserInputNoRequired } from "models/user/types";

async function createSession(userObject: User) {
  return await session.create(userObject.id);
}

async function createAuthenticatedUser(userObject?: CreateUserInputNoRequired) {
  const createdUser = await orch.createUser(userObject);

  const sessionObject = await createSession(createdUser);

  return {
    session: sessionObject,
    user: createdUser,
  };
}

const orchestrator = {
  createSession,
  createAuthenticatedUser,
};

export default orchestrator;
