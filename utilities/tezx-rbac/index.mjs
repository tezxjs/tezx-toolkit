class RBAC {
  plugin = plugin;
  authorize = authorize;
}
function plugin(config) {
  const { loadPermissions, isAuthorized, onDeny } = config;
  if (!loadPermissions) {
    throw new Error("Missing loadPermissions function");
  }
  return async (ctx, next) => {
    ctx.permissions = await loadPermissions(ctx);
    ctx.isAuthorized = isAuthorized;
    const permissions = ctx.permissions || {};
    ctx.permissions = permissions;
    ctx.onDeny = onDeny;
    return next();
  };
}
function authorize(permissionKey) {
  return async function(ctx, next) {
    const roles = Array.isArray(ctx.user?.role) ? ctx.user.role : [ctx.user?.role || "guest"];
    let permissions = ctx?.permissions;
    const mergedPermissions = roles.flatMap((role) => permissions?.[role] || []);
    ctx.user = {
      ...ctx.user,
      permission: mergedPermissions
    };
    const customAuthorized = ctx?.isAuthorized && await ctx.isAuthorized(roles, ctx.user?.permissions, ctx);
    if (customAuthorized || mergedPermissions?.includes(permissionKey)) {
      return next();
    }
    ctx.body = {
      error: "Forbidden",
      message: "You do not have access to this resource.",
      permission: permissionKey
    };
    ctx.setStatus = 403;
    if (ctx.onDeny) {
      return await ctx.onDeny(ctx.body, ctx);
    }
    return ctx.json(ctx.body);
  };
}

export { authorize, RBAC as default, plugin };
