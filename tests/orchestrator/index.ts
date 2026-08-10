import infra from "tests/orchestrator/infra.orchestrator";
import utils from "tests/orchestrator/utils.orchestrator";
import users from "tests/orchestrator/domains/users.orchestrator";
import auth from "tests/orchestrator/auth.orchestrator";
import email from "tests/orchestrator/email.orchestrator";

const orchestrator = {
  ...infra,
  ...utils,
  ...users,
  ...auth,
  ...email,
};

export default orchestrator;
