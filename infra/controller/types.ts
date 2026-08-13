import { User } from "models/user/types";
import { NextApiRequest } from "next";

export type RequestWithContext = {
  context: {
    user: User | AnonymousUser;
  };
} & NextApiRequest;

export type AnonymousUser = {
  features: string[];
  username?: string;
};
