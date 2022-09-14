import * as fs from "fs";
import * as shell from "shelljs";

async function main(additionalArguments: string[]) {
  if (!shell.which("gcloud")) {
    shell.echo("Sorry, this script requires gcloud");
    shell.exit(1);
  }

  if (!shell.which("firebase")) {
    shell.echo("Sorry, this script requires firebase");
    shell.exit(1);
  }

  const baseDir = `${__dirname}/..`;
  const firebaseFunctionsDir = `${baseDir}/apps/firebase-functions`;

  const deploymentEnv = process.env.APP_DEPLOYMENT_ENV ?? "local";
  const envDataInFile = `${firebaseFunctionsDir}/configs/.env.${deploymentEnv}.json`;

  const inData = fs.readFileSync(envDataInFile);
  const envData = JSON.parse(inData.toString());

  const gcloudProject: string | undefined = envData.FIREBASE_PROJECT_ID;

  const execShellCommand = (cmd: string) => {
    return new Promise((resolve, reject) => {
      shell.exec(cmd, (error, stdout, stderr) => {
        if (error) console.warn(error);
        resolve(stdout ? stdout : stderr);
      });
    });
  };

  const asyncForEach = async (array: any[], callback: any) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  const commands: string[] = [];

  console.log("\nTotal postdeploy commands: ", commands.length);

  const save = async (additionalArguments: string[]) => {
    try {
      await asyncForEach(commands, async (cmd: string) => {
        if (!cmd.length) return;
        console.log(`${cmd} ${additionalArguments.join(" ")}`);
        await execShellCommand(`${cmd} ${additionalArguments.join(" ")}`);
      });
    } catch (e) {
      console.warn(e);
      throw Error("Failed");
    } finally {
      console.log("\nDone!\n");
    }
  };

  await save(additionalArguments);
}

(async () => {
  const additionalArguments: string[] = process.argv.slice(2);
  await main(additionalArguments);
})();
