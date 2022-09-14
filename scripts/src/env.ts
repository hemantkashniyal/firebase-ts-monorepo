import {
  getServerSafeEnv,
  getServerSafeEnvFromProcessEnv,
  IServerEnv,
} from "@myapp/config/src/env";
import dotenv from "dotenv";

export interface IScriptsEnv extends IServerEnv {
  USE_FIREBASE_EMULATOR: boolean;
  NGROK_API_KEY: string;
}

export const getScriptsSafeEnvFromProcessEnv = (
  localEnv: NodeJS.ProcessEnv | IScriptsEnv
): IScriptsEnv => {
  const serverSafeEnv = getServerSafeEnvFromProcessEnv(
    localEnv as NodeJS.ProcessEnv
  );
  const { USE_FIREBASE_EMULATOR, NGROK_API_KEY } =
    localEnv as NodeJS.ProcessEnv;
  const scriptsSafeEnv: IScriptsEnv = {
    ...serverSafeEnv,
    USE_FIREBASE_EMULATOR:
      USE_FIREBASE_EMULATOR && ["true", "false"].includes(USE_FIREBASE_EMULATOR)
        ? JSON.parse(USE_FIREBASE_EMULATOR)
        : false,
    NGROK_API_KEY: NGROK_API_KEY ?? "invalid-key",
  };

  return scriptsSafeEnv;
};

let scriptsEnv: IScriptsEnv | undefined = undefined;

export const getScriptsEnv = (): IScriptsEnv => {
  if (scriptsEnv) {
    return scriptsEnv;
  }
  getScriptsSafeEnv(true);
  return scriptsEnv!;
};

const getDotEnvFilePath = (): string => {
  const ENV_DIR = process.env.ENV_DIR || process.cwd();
  const dotEnvFilePath = `.env`;
  return `${ENV_DIR}/${dotEnvFilePath}`;
};

const getScriptsSafeEnv = (loadDotEnv = false): IScriptsEnv => {
  if (loadDotEnv) {
    const result = dotenv.config({ path: getDotEnvFilePath() });
    if (result.error) {
      throw result.error;
    }

    for (const key in result.parsed) {
      process.env[key] = result.parsed[key];
    }
  }

  const localEnv = process.env;

  const scriptsSafeEnv = getScriptsSafeEnvFromProcessEnv(localEnv);
  Object.freeze(scriptsSafeEnv);
  getServerSafeEnv();

  if (!scriptsEnv) {
    scriptsEnv = scriptsSafeEnv;
    Object.freeze(scriptsEnv);
  }

  console.log(scriptsEnv);
  return scriptsEnv;
};
