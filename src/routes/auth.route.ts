import { Routes } from '../interfaces/route.interface';
import Router from "koa-router";
import AuthController from '../controllers/auth.controller';

class AuthRoute implements Routes {
  public path = '/auth';
  public router = new Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, this.authController.signUp);
    this.router.post(`${this.path}/login`, this.authController.login);

  }
}

export default AuthRoute;
