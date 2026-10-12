function handler({
    api,
    helpers,
    event,
    imports
}) {
    const {
        routeMapping,
        buildDefaultRoutePayload
    } = imports["global.recordRoutesMapping"]();

    var route = 'record';
    var targetRoute = 'current';
    const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event);
    
    const routeMap = api.data.dynamic_routing_agent_assist.routeMap;
    const payload = routeMapping(routeMap, defaultRoutePayload, event);

    const {
        emit
    } = api;
    emit('NAV_ITEM_SELECTED', payload);
}
