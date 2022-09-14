import { check, group } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

import { getSummaryHandler } from "./utils";

const apiType = "user";

export let options: Options = {
  vus: 50,
  duration: "10s",
};

export default function getAPI2200() {
  group(`${apiType}: visit user listing page`, function () {
    const res = http.get("https://test-api.k6.io");
    check(res, {
      "status is 200": () => res.status === 200,
    });
  });

  group(`${apiType}: add several users to the platform`, function () {
    const res = http.get("https://test-api.k6.io");
    check(res, {
      "status is 200": () => res.status === 200,
    });
  });
}

export function handleSummary(data) {
  return getSummaryHandler(apiType, data);
}
