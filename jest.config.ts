import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
};

export default createJestConfig(config);
