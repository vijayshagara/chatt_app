import { Context, Next } from 'koa';
import MessageService from '../services/message.service'
import { UserSignupData, UserLoginData } from '../interfaces/auth.interface';
import { HttpException } from '../exceptions/HttpException';

class MessageController {
  public messageService = new MessageService();

  public createMessage = async (ctx: Context, next: Next): Promise<void> => {
    try {
      const messageData = ctx.request.body as UserSignupData;
      const createdMessage = await this.messageService.createMessage(messageData);
      ctx.status = 201;
      ctx.body = { data: createdMessage, message: 'Message created successfully' };
    } catch (error: any) {
      ctx.status = error?.status || 500;
      ctx.body = {
        message: error?.message || 'Internal Server Error',
      };
    }
  };

  public getMessages = async (ctx: Context, next: Next): Promise<void> => {
    try {
      const messages = await this.messageService.getMessages(ctx.query);
      ctx.status = 200;
      ctx.body = { messages, message: 'Messages retrieved successfully' };
    } catch (error: any) {
      ctx.status = error?.status || 500;
      ctx.body = {
        message: error?.message || 'Internal Server Error',
      };
    }
  };

  public updateMessage = async (ctx: Context, next: Next): Promise<void> => {
    try {
      const id = ctx.params.id;
      const messageData = ctx.request.body as UserLoginData;
      const updatedMessage = await this.messageService.updateMessage(id, messageData);
      ctx.status = 200;
      ctx.body = { data: updatedMessage, message: 'Message updated successfully' };
    } catch (error: any) {
      ctx.status = error?.status || 500;
      ctx.body = {
        message: error?.message || 'Internal Server Error',
      };
    }
  };

  public deleteMessage = async (ctx: Context, next: Next): Promise<void> => {
    try {
      const id = ctx.params.id;
      await this.messageService.deleteMessage(id);
      ctx.status = 200;
      ctx.body = { message: 'Message deleted successfully' };
    } catch (error: any) {
      ctx.status = error?.status || 500;
      ctx.body = {
        message: error?.message || 'Internal Server Error',
      };
    }
  };
}

export default MessageController;
