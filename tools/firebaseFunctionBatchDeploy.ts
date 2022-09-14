// Firebase Batch Functions Deploy (Alisson Enz)
// This script helps firebase users deploy their functions when they have more than 60 functions and
// it's not allowed to deploy all using `firebase deploy --only functions` due deployment quota.
// This script will get your functions export from index.js and deploy in batches of 30 and wait 30 seconds.
// This script will NOT delete your function when removed from index.js.
// Instructions
// 0. This instructions suppose that you already have firebase-tools installed and is logged to your account;
// 1. Install `shelljs` (npm install -g shelljs);
// 2. Change the path to point to your index.js at line 16;
// 3. run `yarn ./functionsDeploy` to deploy your functions;
import * as shell from "shelljs";

async function main(additionalArguments: string[]) {
  if (!shell.which("firebase")) {
    shell.echo("Sorry, this script requires firebase");
    shell.exit(1);
  }

  const baseDir = `${__dirname}/..`;
  const firebaseFunctionsDir = `${baseDir}/apps/firebase-functions`;

  const execShellCommand = (cmd: string) => {
    return new Promise((resolve, reject) => {
      shell.exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error("error executing command: ", error);
          reject({
            logs: stdout ? stdout : stderr,
            errorCode: error,
            command: cmd,
          });
          return;
        }
        resolve({
          logs: stdout ? stdout : stderr,
          errorCode: error,
          command: cmd,
        });
      });
    });
  };

  const asyncForEach = async (array: any[], callback: any) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  const getFunctionsList = () => {
    const data = Object.keys(require(`${firebaseFunctionsDir}/dist/index.js`));
    console.log("Exported Functions:", data);
    return data;

    // const { stdout, stderr, code } = shell.exec(
    //   `grep "exports\\." ${__dirname}/build/index.js  | cut -d "=" -f 1 | cut -d "." -f 2 `,
    //   { silent: true, async: false },
    // );
    // if (code !== 0) {
    //   console.log('Error:', stderr);
    //   return [];
    // }
    // const data = stdout.trim().split('\n');
    // data.forEach((element: any, index: number) => {
    //   data[index] = element.trim();
    // });
    // return data;
  };

  const getDeployedFunctionsList = (additionalArguments: string[]) => {
    console.log({
      getFunctionsCmd: `firebase functions:list ${additionalArguments.join(
        " "
      )}`,
    });
    const { stderr, stdout, code } = shell.exec(
      `firebase functions:list ${additionalArguments.join(
        " "
      )} | awk '{print $2}'`,
      { silent: true, async: false }
    );
    if (code !== 0) {
      console.log("Error:", stderr);
      return [];
    }
    const data: string[] = stdout.trim().split("\n");
    return data
      .filter((fn) => !(fn === "" || fn === "Function"))
      .filter((fn) => fn.indexOf("ext-firestore-bigquery") === -1)
      .map((element: string) => element.trim());
  };

  const deleteFunctions = (
    additionalArguments: string[],
    functionNames: string[]
  ) => {
    if (functionNames.length === 0) {
      console.log({ msg: "No function to delete." });
      return;
    }

    console.log({
      deleteCmd: `firebase functions:delete ${functionNames.join(
        " "
      )} ${additionalArguments.join(" ")} --force`,
    });
    const { stderr, stdout, code } = shell.exec(
      `firebase functions:delete ${functionNames.join(
        " "
      )} ${additionalArguments.join(" ")} --force`,
      { silent: true, async: false }
    );
    if (code !== 0) {
      console.log("Error:", stderr);
    }
    console.log(stdout);
  };

  const myFunctions: string[] = getFunctionsList();
  const deployedFunctionsList: string[] =
    getDeployedFunctionsList(additionalArguments);
  console.log({ deployedFunctionsList });
  const functionsToDelete = deployedFunctionsList.filter(
    (fn) => !myFunctions.includes(fn)
  );
  console.log({ functionsToDelete });

  // deleteFunctions(additionalArguments, functionsToDelete);

  const LIMIT = 50;

  const myFunctionBatches = myFunctions.reduce(
    (resultArray: string[][], item, index) => {
      const chunkIndex = Math.floor(index / LIMIT);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] as string[]; // start a new chunk
      }

      resultArray![chunkIndex]!.push(item);

      return resultArray;
    },
    [] as string[][]
  );

  const batches = myFunctionBatches.map(
    (functionArray: string[], _index: number) => {
      console.log(`batching deployment of ${functionArray.length} functions`);
      return (
        "firebase deploy --only functions:" + functionArray.join(",functions:")
      );
    }
  );

  console.log(
    `\nTotal Functions: ${myFunctions.length} batches: ${batches.length}`
  );

  const save = async (additionalArguments: string[]) => {
    try {
      await asyncForEach(batches, async (b: string) => {
        console.log(`${b} ${additionalArguments.join(" ")}`);
        // await execShellCommand(`${b} ${additionalArguments.join(' ')} --force`);
        await execShellCommand("sleep 5");
      });

      console.log("\nDone!\n");
    } catch (e: any) {
      console.warn(e);
      process.exit(e.errorCode);
    }
  };

  await save(additionalArguments);
}

(async () => {
  const additionalArguments: string[] = process.argv.slice(2);
  await main(additionalArguments);
})();
