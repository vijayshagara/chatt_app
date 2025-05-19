import App from "./app";
import validateEnv from './utils/validateEnv';
import AuthRoute from "./routes/auth.route";
import MessageRoute from "./routes/message.route";

validateEnv();
const app = new App([
  new AuthRoute(),
  new MessageRoute(),
]);

app.listen();
