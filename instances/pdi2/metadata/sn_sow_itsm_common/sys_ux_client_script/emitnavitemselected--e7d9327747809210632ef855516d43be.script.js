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
    api.emit('NAV_ITEM_SELECTED', {
        "route": "record",
        "fields": {
            "table": event.payload.table,
            "sysId": event.payload.sys_id ? event.payload.sys_id : -1
        }
    });
}
