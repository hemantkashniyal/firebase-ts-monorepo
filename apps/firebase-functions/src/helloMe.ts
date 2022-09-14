import * as functions from "firebase-functions";
import { getFunctionEnv } from "./env";

export const helloMe = functions.https.onRequest(
  (request: functions.Request, response: functions.Response) => {
    getFunctionEnv();
    response.status(200).send("Hello, Me!!");
  }
);
