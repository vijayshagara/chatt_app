import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import dotenv from "dotenv";
import db from "../models";
import errorHandler from "./middlewares/error.middleware";
import loggerMiddleware from "./middlewares/logger.middleware";
import type { Routes } from "./interfaces/route.interface";
dotenv.config();

class App {
  public app: Koa;
  public env: string;
  public port: string | number;


  constructor(routes: Routes[]) {
    this.app = new Koa();
    this.env = process.env.NODE_ENV || "development";
    this.port = process.env.PORT || 6001;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  private async connectToDatabase() {
    try {
      if (!db.sequelize) {
        throw new Error("Sequelize instance is undefined");
      }

      await db.sequelize.authenticate();
      console.log("✅ DB connected successfully");
    } catch (err) {
      console.error("❌ DB connection error:", err);
    }
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser());
    this.app.use(loggerMiddleware);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route: Routes) => {
      this.app.use(route.router.routes());
      this.app.use(route.router.allowedMethods());
    });
  }

  private initializeErrorHandling() {
    this.app.on("error", errorHandler);
  }

  public listen() {
    console.log("🚀 ~ App ~ this.app.listen ~ this.port:", this.port)
    this.app.listen(this.port, () => {
      console.log("=================================");
      console.log(`======= ENV: ${this.env} =======`);
      console.log(`🚀 App listening on the port ${this.port}`);
      console.log("=================================");
    });
  }

  public getServer() {
    return this.app;
  }
}

export default App;
