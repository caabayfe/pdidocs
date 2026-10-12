function handler({
    api,
    helpers,
    event,
    imports
}) {
    // Bypass dynamic routing for non "record" pages
    if (event.payload.route && event.payload.route !== 'record') {
        api.emit('NAV_ITEM_SELECTED', event.payload);
        return;
    }

    const {
        routeMapping,
        buildDefaultRoutePayload
    } = imports["global.recordRoutesMapping"]();

    var route = 'record';
    var targetRoute = 'current';
    const domainId = api.state.domainId;
    const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event, domainId);

    const routeMap = api.data.dynamic_routing_record.routeMap;
    const payload = routeMapping(routeMap, defaultRoutePayload, event, domainId);

    const {
        emit
    } = api;
    emit('NAV_ITEM_SELECTED', payload);
}
