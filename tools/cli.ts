import { execSync } from "child_process";
import fs from "fs";
import path from "path";
const { performance } = require("perf_hooks");

const CURR_DIR = __dirname;
const BASE_DIR = path.join(CURR_DIR, "..");

const ARGS = process.argv.slice(2);
const COMMAND = ARGS[0];
const FUNCTIONS_DIRECTORY_NAME = ARGS[1];
const FUNCTIONS_DIRECTORY = path.join(BASE_DIR, FUNCTIONS_DIRECTORY_NAME!);
const FUNCTION_NAME = ARGS[2];
const FUNCTION_BUILD_DIR_NAME = ARGS[3] ?? "dist";
const AVAILABLE_COMMANDS = ["generate-entrypoint", "prepare-deploy"];

/**
 *
 * Beggining of entry file
 *
 */

if (!COMMAND) {
  console.log("\n🚨 Please specify a command.\n");
  process.exit(1);
}

if (!AVAILABLE_COMMANDS.includes(COMMAND)) {
  console.log(`\n🚨 Unknown command "${COMMAND}".\n`);
  console.log(`ℹ️  Available commands: ${AVAILABLE_COMMANDS.join(", ")}\n`);
  process.exit(1);
}

if (!FUNCTION_NAME) {
  console.log("\n🚨 Please specify a function name.\n");
  process.exit(1);
}

if (COMMAND === "generate-entrypoint") {
  const START_TIME = performance.now();
  console.log("⚠️ Function Name:", FUNCTION_NAME);
  buildFunctionEntryPoint(FUNCTION_NAME);
  const END_TIME = performance.now();

  console.log(
    `\n🏁 Finished in ${(END_TIME - START_TIME).toPrecision(4)} milliseconds\n`
  );
  process.exit(0);
}

if (COMMAND === "prepare-deploy") {
  console.log(`\n⛏  Preparing functions "${FUNCTION_NAME}" for deploy...`);

  buildFunctionEntryPoint(FUNCTION_NAME);
  prepareFunctionForDeploy(FUNCTION_NAME);

  console.log(`\n🚀 Functions "${FUNCTION_NAME}" prepared for deploy!`);
  console.log(
    `ℹ️  Use "gcloud functions deploy ${FUNCTION_NAME} --runtime nodejsXX" to deploy the function.\n`
  );

  process.exit(0);
}

/**
 *
 * Functions used in entry point
 *
 */
function buildFunctionEntryPoint(functionName: string) {
  const functionDir = path.join(FUNCTIONS_DIRECTORY, functionName);

  const isFunctionExists = fs.existsSync(functionDir);
  console.log("⚠️ Function Dir:", functionDir);
  if (!isFunctionExists) {
    console.log(`❌  Function "${functionName}" does not exist.`);
    process.exit(1);
  }

  const functionDistDir = path.join(functionDir, FUNCTION_BUILD_DIR_NAME);
  console.log("⚠️ Function Dist Dir", functionDir);

  const isFunctionBuilded = fs.existsSync(functionDistDir);
  if (!isFunctionBuilded) {
    console.log(`⚠️  Function "${functionName}" is not builded.`);
    runFunctionBuild(functionName);
  }

  const functionPackageDir = path.join(functionDistDir, "packages");
  console.log("⚠️ Function Package Dir:", functionPackageDir);

  const hasFunctionPackage = fs.existsSync(functionPackageDir);
  if (!hasFunctionPackage) {
    console.log(
      `ℹ️ Function "${functionName}" has no packages. No need to generate entry file. Skipping...`
    );
    return;
  }

  const entryFile = generateEntryFile(functionName);

  const indexJsPath = path.join(functionDistDir, "index.js");
  fs.writeFileSync(indexJsPath, entryFile);

  console.log(
    `\n🎫 Function "${functionName}" entry file generated succesfuly 🎉.`
  );
}

function generateEntryFile(functionName: string) {
  const packagesConfig = getInternalPackageConfig(functionName);

  const aliases = packagesConfig.map((config) => config.alias).join(",\n  ");

  const entryFile = `\
const path = require("path");
const moduleAlias = require("module-alias");

moduleAlias.addAliases({
  ${aliases}
});

module.exports = require("./${FUNCTIONS_DIRECTORY_NAME}/${functionName}/src/index");
  `;

  return entryFile;
}

function runFunctionBuild(functionName: string) {
  console.log(`🏗  Building "${functionName}" function...`);
  try {
    const functionDir = path.join(FUNCTIONS_DIRECTORY, functionName);
    const packageJsonPath = path.join(functionDir, "package.json");
    const packageJsonFile = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonFile);

    const response = execSync(`yarn workspace ${packageJson.name} build`);

    console.log(`✅ Function "${functionName}" builded!`);
  } catch (error) {
    console.log("\n🚨 Error while building function!\n", error);
    process.exit(1);
  }
}

function prepareFunctionForDeploy(functionName: string) {
  const functionPackageConfig = getInternalPackageConfig(functionName);

  // console.log("functionPackageConfig", functionPackageConfig);

  console.log("👀 Reading package.json file...");

  const functionPackageJsonPath = path.join(
    FUNCTIONS_DIRECTORY,
    functionName,
    "package.json"
  );

  const functionPackageJsonTargetfile = JSON.parse(
    process.env.APP_CI ?? "false"
  )
    ? "package.json"
    : "package.deploy.json";
  const functionPackageJsonTargetPath = path.join(
    FUNCTIONS_DIRECTORY,
    functionName,
    functionPackageJsonTargetfile
  );
  const packageJson = fs.readFileSync(functionPackageJsonPath, "utf8");
  const packageJsonObj = JSON.parse(packageJson);

  console.log(`📦 Updating ${functionPackageJsonTargetfile} file...`);

  const updatedDependencies = functionPackageConfig.reduce(
    (acc, packageConfig) => {
      delete acc[packageConfig.name];

      return {
        ...acc,
        ...packageConfig.dependencies,
      };
    },
    packageJsonObj.dependencies
  );

  const updatedPackageJson = {
    ...packageJsonObj,
    dependencies: updatedDependencies,
  };

  fs.writeFileSync(
    functionPackageJsonTargetPath,
    JSON.stringify(updatedPackageJson, null, 2)
  );

  console.log(
    `🤞 ${functionPackageJsonTargetfile} updated with all needed dependencies`
  );

  const yarnLockPath = path.join(BASE_DIR, "yarn.lock");
  const yarnLockDestination = path.join(
    FUNCTIONS_DIRECTORY,
    functionName,
    "yarn.lock"
  );
  fs.copyFileSync(yarnLockPath, yarnLockDestination);

  console.log("📦  yarn.lock copied");
}

function getInternalPackageConfig(functionName: string) {
  const functionPackageDir = path.join(
    FUNCTIONS_DIRECTORY,
    functionName,
    FUNCTION_BUILD_DIR_NAME,
    "packages"
  );

  if (!fs.existsSync(functionPackageDir)) {
    return [];
  }

  const packageNames = fs.readdirSync(functionPackageDir);

  const monorepoPackages: string[] = [];

  packageNames.forEach((packageName) => {
    const packageFile = path.join(
      BASE_DIR,
      "packages",
      packageName,
      "package.json"
    );
    const pkgJson = require(packageFile);
    monorepoPackages.push(pkgJson.name);
  });

  // console.log("monorepoPackages", monorepoPackages);

  return packageNames
    .map((packageName) => {
      const packageDir = path.join(
        BASE_DIR,
        "packages",
        packageName,
        "package.json"
      );

      const packageJsonFile = fs.readFileSync(packageDir, "utf8");
      const packageJson = JSON.parse(packageJsonFile);

      const packageDependencies: Record<string, string> = {};
      Object.entries(packageJson.dependencies ?? {}).forEach((data) => {
        if (!monorepoPackages.includes(data[0])) {
          packageDependencies[data[0]] = data[1] as string;
        }
      });
      // console.log("packageDependencies", packageDependencies);

      return [
        {
          name: packageJson.name,
          alias: `"${packageJson.name}": path.join(__dirname, "packages/${packageName}/src")`,
          dependencies: packageDependencies,
        },
        {
          name: `${packageJson.name}/src`,
          alias: `"${packageJson.name}/src": path.join(__dirname, "packages/${packageName}/src")`,
          dependencies: packageDependencies,
        },
      ];
    })
    .reduce((accumulator, value) => accumulator.concat(value), []);
}
