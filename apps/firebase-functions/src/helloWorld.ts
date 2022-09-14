import { getCowMessage } from "@myapp/greetings";
import { globalName } from "@myapp/greetings/hello";
import escapeHtml from "escape-html";
import * as functions from "firebase-functions";

export const helloWorld = functions.https.onRequest(
  (req: functions.Request, res: functions.Response) => {
    const reqName = String(req.query.name || "Anonymous");
    const name = escapeHtml(reqName);

    const newName = globalName;

    const message = getCowMessage(`${name} ${newName}`);

    res.send(`<pre>${message}</pre>`);

    // res.status(200).send("Hello, World!");
  }
);
