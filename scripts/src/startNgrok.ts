import { getCowMessage } from "@myapp/greetings";
import * as ngrok from "ngrok";
import { getScriptsEnv } from "./env";

(async () => {
  const ngrokConfig = {
    authtoken: getScriptsEnv().NGROK_API_KEY,
  };
  console.log(getCowMessage("hi"));
  const url = await ngrok.connect({
    addr: 4200,
    host: "localhost",
    host_header: 4200,
    ...ngrokConfig,
  });
  console.log(url);
})();
