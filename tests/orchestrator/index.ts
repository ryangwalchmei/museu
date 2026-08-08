import infra from "tests/orchestrator/infra.orchestrator";
import utils from "tests/orchestrator/utils.orchestrator";
import users from "tests/orchestrator/domains/users.orchestrator";

const orchestrator = {
  ...infra,
  ...utils,
  ...users,
};

export default orchestrator;
