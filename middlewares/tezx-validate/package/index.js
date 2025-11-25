function validate({
  onError,
  adapter,
  transform,
  parseBody = "json",
  source = "body"
}) {
  const parser = parseBody ?? "json";
  return async (ctx, next) => {
    try {
      let input;
      if (source === "body") {
        input = await ctx.req[parser]();
      } else if (source === "query") {
        input = ctx?.req?.query;
      } else if (source === "params") {
        input = ctx.req.params;
      } else {
        ctx.status(400);
        throw new Error("Invalid source option");
      }
      const validated = await adapter.validate(input);
      const finalData = transform ? await transform(validated) : validated;
      ctx.validated = finalData;
      await next();
    } catch (err) {
      const tezErr = err instanceof Error ? err : new Error(err);
      if (onError) {
        return await onError(tezErr, ctx);
      } else {
        throw tezErr;
      }
    }
  };
}

export { validate };
