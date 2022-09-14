import * as functions from "firebase-functions";

import {
  getServerSafeEnv,
  getServerSafeEnvFromProcessEnv,
  IServerEnv,
} from "@myapp/config/src/env";

export interface IFunctionEnv extends IServerEnv {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PROJECT_REGION: string;
}

export const getFunctionSafeEnvFromProcessEnv = (
  localEnv: NodeJS.ProcessEnv | IFunctionEnv
): IFunctionEnv => {
  const serverSafeEnv = getServerSafeEnvFromProcessEnv(
    localEnv as NodeJS.ProcessEnv
  );
  const { FIREBASE_PROJECT_ID, FIREBASE_PROJECT_REGION } =
    localEnv as NodeJS.ProcessEnv;
  const FunctionSafeEnv: IFunctionEnv = {
    ...serverSafeEnv,
    FIREBASE_PROJECT_ID: FIREBASE_PROJECT_ID!,
    FIREBASE_PROJECT_REGION: FIREBASE_PROJECT_REGION!,
  };

  return FunctionSafeEnv;
};

let functionEnv: IFunctionEnv | undefined = undefined;

export const getFunctionEnv = (): IFunctionEnv => {
  if (functionEnv) {
    return functionEnv;
  }
  getFunctionSafeEnv();
  return functionEnv!;
};

const getFunctionSafeEnv = (): IFunctionEnv => {
  let localEnv;
  if (process.env.USE_FIREBASE_EMULATOR) {
    // ts built file is in dist folder and this path is relative to ./dist/.../env.js

    const data = require(`${process.env.FIREBASE_EMULATOR_FUNCTION_CONFIG_DIR}/.env.local.json`);
    console.log();
    localEnv = data as IFunctionEnv;
  } else {
    localEnv = functions.config().env as IFunctionEnv;
  }

  const functionSafeEnv = getFunctionSafeEnvFromProcessEnv(localEnv);
  Object.freeze(functionSafeEnv);
  getServerSafeEnv();

  if (!functionEnv) {
    functionEnv = functionSafeEnv;
    Object.freeze(functionEnv);
  }

  if (process.env.USE_FIREBASE_EMULATOR) {
    console.log(functionSafeEnv);
  }

  console.log(functionEnv);
  return functionEnv;
};
