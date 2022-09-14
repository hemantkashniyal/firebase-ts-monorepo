import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import fs from 'fs';
import * as path from "path";


export const getRollupConfig = (appName, inputFilePath, deps = []) => {


  // const appName = "@myapp";
  const appNamePrefix = `${appName}/`;

  // const inputFilePath = 'tmp/apps/firebase-functions/src/index.js';
  const defaultInputPath = 'tmp/index.js';

  const findAdditionalPackages = (globalAdditionalMonorepoPackages, pkg = '.', parent = 'NA') => {
    const foundMonorepoPackages = [...globalAdditionalMonorepoPackages];

    const pkgJson = require(`${pkg}/package.json`);
    console.log("Scanning Monorepo Package:", pkgJson.name, ", Parent:", parent);
    const pkgDependencies = Object.keys(pkgJson.dependencies || {}).filter(x => x.includes(appNamePrefix));
    pkgDependencies.forEach(depPkg => {
      if (!foundMonorepoPackages.includes(depPkg)) {
        foundMonorepoPackages.push(...findAdditionalPackages(foundMonorepoPackages, depPkg, pkgJson.name));
        foundMonorepoPackages.push(depPkg)
      } else {
        console.log("Skipping Monorepo Package: ", depPkg, "Parent:", parent);
      }
    });

    const finalMonorepoPackages = new Set([...globalAdditionalMonorepoPackages, ...foundMonorepoPackages])
    // console.log("Found Monorepo Package: ", [...finalMonorepoPackages]);
    return [...finalMonorepoPackages]
  }

  let additionalMonorepoPackages = [];
  additionalMonorepoPackages = findAdditionalPackages(additionalMonorepoPackages);
  console.log("Including Monorepo Packages: ", additionalMonorepoPackages);

  const updateAliasPluginEntries = (pkgName, globalAliasPluginEntries) => {
    let finalAliasPluginEntries = {
      ...globalAliasPluginEntries,
    };

    const pkgDirName = pkgName.substring(appNamePrefix.length);
    const pkgPath = path.join(__dirname, `tmp/packages/${pkgDirName}/src`);

    // this order is important
    finalAliasPluginEntries[`${pkgName}/src`] = pkgPath;
    finalAliasPluginEntries[`${pkgName}`] = pkgPath;

    return finalAliasPluginEntries;
  }

  const updateDependency = (pkgName, globalDependencies) => {
    const pkgJson = require(`${pkgName}/package.json`);
    const pkgDependencies = Object.keys(pkgJson.dependencies || {}).filter(x => !x.includes(appNamePrefix));

    const finalDependencies = new Set([...globalDependencies, ...pkgDependencies])
    return [...finalDependencies]
  }
  /**
   * Add here external dependencies that actually you use.
   */
  let externals = [...deps];
  ['.', ...additionalMonorepoPackages].forEach(pkg => {
    externals = updateDependency(pkg, externals);
  });
  console.log("Using Monorepo Packages External Dependencies: ", externals);


  let aliasPluginEntries = {}
  additionalMonorepoPackages.forEach(pkg => {
    aliasPluginEntries = updateAliasPluginEntries(pkg, aliasPluginEntries);
  });
  console.log("Using Monorepo Packages Alias: ", aliasPluginEntries);

  return {
    input: fs.existsSync(inputFilePath) ? inputFilePath : defaultInputPath,
    external: externals,
    plugins: [
      alias(
        {
          entries: aliasPluginEntries,
          // entries: {
          //   '@myapp/config/src': path.join(__dirname, "tmp/packages/config/src"),
          //   '@myapp/config': path.join(__dirname, "tmp/packages/config/src"),
          //   '@myapp/greetings/src': path.join(__dirname, "tmp/packages/greetings/src"),
          //   '@myapp/greetings': path.join(__dirname, "tmp/packages/greetings/src")
          // }
          // entries: [
          //   {
          //     find: '@myapp/config',
          //     replacement: path.join(__dirname, "tmp/packages/config/src")
          //   },
          //   {
          //     find: '@myapp/greetings',
          //     replacement: path.join(__dirname, "tmp/packages/greetings/src")
          //   }
          // ]
        }
      ),
      resolve({ modulesOnly: true })
    ],
    onwarn: () => { },
    output: {
      file: 'dist/index.js',
      format: 'commonjs',
      sourcemap: false,
    },
  };

}

