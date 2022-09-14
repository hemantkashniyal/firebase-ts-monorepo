import * as fs from "fs";

import { getFunctionSafeEnvFromProcessEnv } from "../apps/firebase-functions/src/env";

async function main() {
  const baseDir = `${__dirname}/..`;
  const firebaseFunctionsDir = `${baseDir}/apps/firebase-functions`;

  const deploymentEnv = process.env.APP_DEPLOYMENT_ENV ?? "dev";
  const envDataInFile = `${firebaseFunctionsDir}/configs/.env.${deploymentEnv}.json`;
  const envDataOutFile = `${firebaseFunctionsDir}/configs/.env.deploy.json`;

  console.log("Updating deployment env file", envDataInFile);

  // const secretService = new SecretService();

  const inData = fs.readFileSync(envDataInFile);
  const envData = JSON.parse(inData.toString());

  const envKeys = getFunctionSafeEnvFromProcessEnv(process.env);

  for (const key in envData) {
    if ((envKeys as any)[key]) {
      console.log("Overriding from local environment", key);
      envData[key] = (envKeys as any)[key];
    }
    // const secretData = (await secretService.get(
    //   envData.FIREBASE_PROJECT_ID,
    //   key
    // ))!;
    // if (secretData) {
    //   console.log("Overriding from cloud secrets", key);
    //   envData[key] = secretData;
    // }
  }

  console.log("Computed deployment env:", envData);

  const outData = JSON.stringify(envData, null, 4);
  fs.writeFileSync(envDataOutFile, outData, "utf8");

  console.log("Updated deployment env file", envDataOutFile);
}

(async () => {
  await main();
})();
