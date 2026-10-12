/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var route = event?.payload?.item?.route;
    if(route){
        api.emit("NAV_ITEM_SELECTED", {
            route: route,
        });
    }
}
