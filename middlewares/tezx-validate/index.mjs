import { TezXError } from 'tezx';

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
        throw new TezXError("Invalid source option", 400);
      }
      const validated = await adapter.validate(input);
      const finalData = transform ? await transform(validated) : validated;
      ctx.validated = finalData;
      await next();
    } catch (err) {
      const tezErr = err instanceof TezXError ? err : err instanceof Error ? new TezXError(err.message, 400, err.stack) : new TezXError("Validation failed", 400);
      if (onError) {
        return await onError(tezErr, ctx);
      } else {
        throw tezErr;
      }
    }
  };
}

export { validate };
