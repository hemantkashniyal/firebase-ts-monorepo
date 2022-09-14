import { getRollupConfig } from '../../../tools/rollupConfigGenerator';

const appName = "@myapp";
const inputFilePath = 'tmp/apps/gcf-functions/funny-world/src/index.js';

const data = getRollupConfig(appName, inputFilePath);

export default data;

