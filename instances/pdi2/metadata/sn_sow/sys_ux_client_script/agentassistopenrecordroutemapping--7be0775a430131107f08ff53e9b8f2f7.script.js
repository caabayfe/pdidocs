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
    const domainId = api.state.domainId;
    const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event, domainId);

    const routeMap = api.data.dynamic_routing.routeMap;
    const payload = routeMapping(routeMap, defaultRoutePayload, event, domainId);
    payload.multiInstField = "sysId";

    // If a table name passed into trueupTable matches the existing table
    // refresh trueup DR to get real table name; otherwise use existing.
    if(api.state.routeParentTables && api.state.routeParentTables.split(',').find(table => table === payload.fields.table)) {
        api.setState('navigationPayload', payload);
    } else { 
        api.emit('NAV_ITEM_SELECTED', payload);
    }
}
