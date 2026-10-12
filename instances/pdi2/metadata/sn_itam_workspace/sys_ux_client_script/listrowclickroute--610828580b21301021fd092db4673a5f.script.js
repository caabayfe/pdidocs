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
    var targetRoute = '';
    const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event);
    
    const routeMap = api.data.dynamic_routing_sw.routeMap;
    const payload = routeMapping(routeMap, defaultRoutePayload, event);
    // If a table name passed into trueupTable matches the existing table
    // refresh trueup DR to get real table name; otherwise use existing.
    if(api.state.routeParentTables && api.state.routeParentTables.split(',').find(table => table === payload.fields.table)) {
        api.setState('navigationPayload', payload); 
        api.data.resolve_route_parent_tables.refresh(); 
    } else { 
        api.emit('NAV_ITEM_SELECTED', payload); 
    } 

}
