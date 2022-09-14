import { group } from "k6";

import { getSummaryHandler } from "./utils";

import * as product from "./api.product.test";
import * as user from "./api.user.test";

const apiType = "overall";

export default () => {
  group(`${apiType}: load test`, function () {
    product.default();
    user.default();
  });
};

export function handleSummary(data) {
  return getSummaryHandler(apiType, data);
}
