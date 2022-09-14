import { ParseEnv } from "./parseEnv";

export interface IBaseEnv {}

export interface IServerEnv extends IBaseEnv {
  APP_FEATURE_1?: boolean;
}

let env: IServerEnv | undefined = undefined;

export const getServerSafeEnvFromProcessEnv = (
  localEnv: NodeJS.ProcessEnv | IServerEnv
): IServerEnv => {
  const { APP_FEATURE_1 } = localEnv as NodeJS.ProcessEnv;
  const ServerSafeEnv: IServerEnv = {
    APP_FEATURE_1: ParseEnv.getBooleanOrUndefined(APP_FEATURE_1) ?? true,
  };

  return ServerSafeEnv;
};

export const getServerEnv = (): IServerEnv => {
  if (env) {
    return env;
  }
  getServerSafeEnv();
  return env!;
};

export function getServerSafeEnv(
  overrideEnv?: NodeJS.ProcessEnv,
  force = false
): IServerEnv {
  const localEnv = overrideEnv ?? process.env;

  const serverSafeEnv = getServerSafeEnvFromProcessEnv(localEnv);

  for (const key in serverSafeEnv) {
    process.env[key] = (serverSafeEnv as any)[key];
  }

  Object.freeze(serverSafeEnv);

  if (!env || force) {
    env = serverSafeEnv;
    Object.freeze(env);
  }

  return serverSafeEnv;
}
