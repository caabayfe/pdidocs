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

    // If a table name passed into trueupTable matches the existing table
    // refresh trueup DR to get real table name; otherwise use existing.
    // Skip trueup for new records (sysId === '-1') as resolve_route_parent_tables
    // data broker may not exist on Record Default page.
    if(payload.fields && payload.fields.sysId != null && payload.fields.sysId !== '-1' && api.state.routeParentTables && api.state.routeParentTables.split(',').find(table => table === payload.fields.table)) {
        api.setState('navigationPayload', payload); 
        api.data.resolve_route_parent_tables.refresh(); 
    } else { 
        api.emit('NAV_ITEM_SELECTED', payload); 
    } 
}
