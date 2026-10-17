/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const {
        routeMapping,
        buildDefaultRoutePayload
    } = imports["global.recordRoutesMapping"]();
    var route = 'record';
    var targetRoute = 'current';
    const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event);
    
    const routeMap = api.data.guidance_dynamic_route_mapping.routeMap;
    const payload = routeMapping(routeMap, defaultRoutePayload, event);

    const {
        emit
    } = api;
    emit('NAV_ITEM_SELECTED', payload);
}
