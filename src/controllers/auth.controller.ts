import { Context, Next } from 'koa';
import AuthService from '../services/auth.service';
import { UserSignupData, UserLoginData } from '../interfaces/auth.interface';
import { HttpException } from '../exceptions/HttpException';

class AuthController {
  public authService = new AuthService();

  public signUp = async (ctx: Context, next: Next): Promise<void> => {
    try {
      const userData = ctx.request.body as UserSignupData;
      const signUpUserData = await this.authService.signup(userData);
      ctx.status = 201;
      ctx.body = { data: signUpUserData, message: 'Signup successful' };
    } catch (error: any) {
      ctx.status = error?.status || 500;
      ctx.body = {
        message: error?.message || 'Internal Server Error',
      };
    }
  };

  public login = async (ctx: Context, next: Next): Promise<void> => {
    try {
      const userData = ctx.request.body as UserLoginData;
      const { tokenData, userInfo } = await this.authService.login(userData);
      ctx.status = 200;
      ctx.body = { tokenData, userInfo, message: 'Login successful' };
    } catch (error: any) {
      ctx.status = error?.status || 500;
      ctx.body = {
        message: error?.message || 'Internal Server Error',
      };
    }
  };
}

export default AuthController;
