// this config includes typescript specific settings
// and if you're not using typescript, you should remove `transform` property
export default {
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  testRegex: "src(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["lib/", "node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "node",
  rootDir: "src",
};
