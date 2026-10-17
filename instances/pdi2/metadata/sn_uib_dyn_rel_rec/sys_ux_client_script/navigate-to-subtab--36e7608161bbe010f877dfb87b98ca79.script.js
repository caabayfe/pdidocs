/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    let redirectPayload = {
        "redirect": true,
        "route":"record",
        "targetRoute": "current",
        "fields": {
            "table": event.payload.table,
            "sysId": event.payload.sysId
        }
    };
    api.emit("NAV_ITEM_SELECTED", redirectPayload);
}
