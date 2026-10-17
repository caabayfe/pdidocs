/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Copy of client script 4a97ef02b7612110505918075e11a918
    // Bypass dynamic routing for non "record" pages and for DA's creating new records
    var isNonRecordRoute = event.payload.route && event.payload.route !== 'record';
    var isNewRecord = event.payload.fields && event.payload.fields.sysId === '-1';
    if (isNonRecordRoute || isNewRecord) {
        api.emit('NAV_ITEM_SELECTED', event.payload);
        return;
    }

    const {
        routeMapping,
        buildDefaultRoutePayload
    } = imports["global.recordRoutesMapping"]();

    // If an alternative path for a record page has been specified, use that.
    // Fallback to "record" otherwise.
    var featureRoutes;
    if (api.context.app.featureRoutes)
        featureRoutes  = JSON.parse(api.context.app.featureRoutes);
    var route = featureRoutes?.record?._default?.routeInfo?.route || 'record';

    var targetRoute = '';
    const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event);
    const routeMap = api.data.dynamic_routing_record.routeMap;
    const payload = routeMapping(routeMap, defaultRoutePayload, event);

    if (event.payload.sys_id && event.payload.sys_id !== '-1') {
        event.payload?.isFirstNonRef
            ? api.emit('NAV_ITEM_SELECTED', payload)
            : api.setState('navigationPayload', payload);
    } else {
        api.emit('NAV_ITEM_SELECTED', payload);
    }
}
