import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

import {
  jUnit,
  textSummary
} from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const getSummaryHandler = (
  apiType: string,
  data: any,
  summaryDir: string = "summary"
): any => {
  // fs.existsSync(summaryDir) || fs.mkdirSync(summaryDir);
  // fs.existsSync(`${summaryDir}/html`) || fs.mkdirSync(`${summaryDir}/html`);
  // fs.existsSync(`${summaryDir}/junit`) || fs.mkdirSync(`${summaryDir}/junit`);

  const summaryData: any = {};
  summaryData["stdout"] = textSummary(data, {
    indent: " ",
    enableColors: true
  });

  const htmlSummaryFilename = `${summaryDir}/html/${apiType}.html`;
  summaryData[htmlSummaryFilename] = htmlReport(data);

  const junitSummaryFilename = `${summaryDir}/junit/${apiType}.junit.xml`;
  summaryData[junitSummaryFilename] = jUnit(data);

  const jsonSummaryFilename = `${summaryDir}/json/${apiType}.json`;
  summaryData[jsonSummaryFilename] = JSON.stringify(data, null, 2);

  return summaryData;
};
