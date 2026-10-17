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
        "targetRoute": "current",
        "fields": {
            "table": api.state.targetTable,
            "sysId": api.state.targetSysId
        }
    });
}
