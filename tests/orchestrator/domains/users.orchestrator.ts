import { faker, fakerPT_BR } from "@faker-js/faker";
import user from "models/user";
import { cpf } from "cpf-cnpj-validator";
import { CreateUserInputNoRequired } from "models/user/types";

async function createUser(userObject: CreateUserInputNoRequired) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "validpassword",
    cpf: userObject?.cpf || cpf.generate(false),
    phone:
      userObject?.phone ||
      fakerPT_BR.phone.number({
        style: "national",
      }),
    address: userObject?.address || faker.location.streetAddress(),
    avatar_url: userObject?.avatar_url || faker.image.avatar(),
  });
}

const orchestrator = {
  createUser,
};

export default orchestrator;
