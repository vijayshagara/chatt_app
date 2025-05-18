import { Routes } from '../interfaces/route.interface';
import Router from "koa-router";
import MessageController from '../controllers/message.controller';

class AuthRoute implements Routes {
  public path = '/messages';
  public router = new Router();
  public messageController = new MessageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.messageController.createMessage);
    this.router.get(`${this.path}`, this.messageController.getMessages);
    this.router.put(`${this.path}/:id`, this.messageController.updateMessage);
    this.router.delete(`${this.path}/:id`, this.messageController.deleteMessage);
  }
}

export default AuthRoute;
