/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var route = api.data.resolve_routes.output || {};

    if (Object.keys(route).length > 0) {
        api.emit('NAV_ITEM_SELECTED', route);
        // reset the state after navigation is complete
        api.setState('routeResolverObj', {});
    }
}
