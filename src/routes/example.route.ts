import Router from "koa-router";

const router = new Router();

router.get("/", async (ctx) => {
  ctx.body = "This is the /example route";
});

export default router;
