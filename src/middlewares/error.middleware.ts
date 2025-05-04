import { Context } from "koa";
export default function errorHandler(err: Error, ctx: Context) {
  console.error("Unhandled error:", err);
  ctx.status = (err as any).status || 500;
  ctx.body = {
    message: err.message || "Internal Server Error",
  };
}
