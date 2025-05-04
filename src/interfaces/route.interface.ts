import Router from "koa-router";

export interface Routes {
  path?: string;
  router: Router;
}
