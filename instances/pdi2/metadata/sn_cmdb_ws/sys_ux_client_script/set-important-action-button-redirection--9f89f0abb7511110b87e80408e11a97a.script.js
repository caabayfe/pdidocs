/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     const {
        sanitizeNavigationPayload
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    let navigationPayload = "";
    if (event && event.context && event.context.item && event.context.item.value && event.context.item.value.navigation) {
        navigationPayload = event.context.item.value.navigation;
    }

    api.emit('NAV_ITEM_SELECTED', sanitizeNavigationPayload(navigationPayload));
}
