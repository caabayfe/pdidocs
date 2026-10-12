function handler({ api, helpers, event, imports }) {
  const { routeMapping, buildDefaultRoutePayload } =
    imports["global.recordRoutesMapping"]();
  const { payload } = event;
  // update elementId to support backwards compatibility
  // need to change the hardcoded elementId in route configurations
  event.elementId = "workspace_global_search";
  if (!payload.source) return;
  const { emit } = api;
  const {
    context,
    sysId,
    table,
    isPolarisContext,
    classicRouteConfig,
    searchRouteMap,
    openInNewTab,
    title,
  } = payload;
  if (isPolarisContext && classicRouteConfig) {
    emit("NAV_ITEM_SELECTED", { ...classicRouteConfig });
    return;
  }
  const defaultRoute = "record";
  const targetRoute = "";
  const defaultRoutePayload = buildDefaultRoutePayload(
    defaultRoute,
    targetRoute,
    event
  );
  const payloadMap = routeMapping(searchRouteMap, defaultRoutePayload, event);
  const { route, params, fields } = payloadMap;
  if (openInNewTab) {
    if (isPolarisContext && classicRouteConfig) {
      emit("NAV_ITEM_SELECTED", { ...classicRouteConfig });
      return;
    } else {
      const { path } = context;
      const url = path + "/" + route + "/" + table + "/" + sysId;
      emit("NAV_ITEM_SELECTED", {
        context,
        external: {
          url,
        },
      });
    }
  } else {
    emit("NAV_ITEM_SELECTED", {
      route,
      params,
      fields,
      context,
      title,
    });
  }
}
