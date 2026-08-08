import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",

  moduleDirectories: ["node_modules", "<rootDir>"],

  testTimeout: 60000,

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },

  extensionsToTreatAsEsm: [".ts", ".tsx"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

export default config;
