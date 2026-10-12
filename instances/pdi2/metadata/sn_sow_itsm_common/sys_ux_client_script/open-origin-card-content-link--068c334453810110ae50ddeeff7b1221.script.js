/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload && event.payload.item && event.payload.item.data) {
        api.emit("NAV_ITEM_SELECTED", {
            route: "record",
            targetRoute: "current",
            fields: {
                table: event.payload.item.data.table,
                sysId: event.payload.item.data.sysId
            }
        });
    }
}
