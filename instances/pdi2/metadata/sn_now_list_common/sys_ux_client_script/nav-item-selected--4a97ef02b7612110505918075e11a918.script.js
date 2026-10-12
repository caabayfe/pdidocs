/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
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

    // If the table matches a specified route parent table, determine the
    // corresponding child table name. For example, a navigation payload of the
    // task table along with the sysId for INC0000001 would map to the incident
    // table.
    // Due to DEF0386852: When the sysId is -1 (a new record), this logic has to
    // be skipped, otherwise no table gets returned.

    if (event.payload.sys_id && event.payload.sys_id !== '-1') {
        event.payload?.isFirstNonRef
            ? api.emit('NAV_ITEM_SELECTED', payload)
            : api.setState('navigationPayload', payload);
    } else {
        api.emit('NAV_ITEM_SELECTED', payload);
    }

}
