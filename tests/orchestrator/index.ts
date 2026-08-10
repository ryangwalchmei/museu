import infra from "tests/orchestrator/infra.orchestrator";
import utils from "tests/orchestrator/utils.orchestrator";
import users from "tests/orchestrator/domains/users.orchestrator";
import auth from "tests/orchestrator/auth.orchestrator";

const orchestrator = {
  ...infra,
  ...utils,
  ...users,
  ...auth,
};

export default orchestrator;
