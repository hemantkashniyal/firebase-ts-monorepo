import { check, group, sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

import { getSummaryHandler } from "./utils";

const apiType = "product";

export let options: Options = {
  scenarios: {
    example_scenario: {
      // name of the executor to use
      executor: "shared-iterations",

      // common scenario configuration
      startTime: "10s",
      gracefulStop: "5s",
      env: { EXAMPLEVAR: "testing" },
      tags: { example_tag: "testing" },

      // executor-specific configuration
      vus: 10,
      iterations: 10,
      maxDuration: "30s"
    },
    another_scenario: {
      // name of the executor to use
      executor: "shared-iterations",

      // common scenario configuration
      startTime: "10s",
      gracefulStop: "5s",
      env: { EXAMPLEVAR: "testing" },
      tags: { example_tag: "testing" },

      // executor-specific configuration
      vus: 10,
      iterations: 10,
      maxDuration: "30s"
    }
  }
};

export default function() {
  group(`${apiType}: visit product listing page`, function() {
    const res = http.get("https://test-api.k6.io");
    check(res, {
      "status is 200": () => res.status === 200
    });
  });

  group(`${apiType}: add several products to the shopping cart`, function() {
    const res = http.get("https://test-api.k6.io");
    check(res, {
      "status is 200": () => res.status === 200
    });
  });

  group(`${apiType}: visit login page`, function() {
    const res = http.get("https://test-api.k6.io");
    check(res, {
      "status is 200": () => res.status === 200
    });
  });

  group(`${apiType}: authenticate`, function() {
    const res = http.get("https://test-api.k6.io");
    check(res, {
      "status is 200": () => res.status === 300
    });
  });

  group(`${apiType}: checkout process`, function() {
    const res = http.get("https://test-api.k6.io");
    check(res, {
      "status is 200": () => res.status === 200
    });
  });
  sleep(30000);
}

export function handleSummary(data) {
  return getSummaryHandler(apiType, data);
}
