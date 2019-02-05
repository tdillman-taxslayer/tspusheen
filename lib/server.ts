import app from "./app";
import { Config } from "./config";

app.listen(Config.PORT, () => {
  console.log("Express server listening on part " + Config.PORT);
});
