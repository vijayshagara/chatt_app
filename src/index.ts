import Koa from "koa";
import { configDotenv } from "dotenv";

const app = new Koa();
configDotenv();

app.use(async (ctx) => {
  ctx.body = "Hello, Koa with TypeScript!";
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
