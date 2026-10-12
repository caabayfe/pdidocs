/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const fields = {
        "table": event.payload.item.table,
        "sysId": event.payload.item.sysId,
    };

    helpers.navigate.to("record", fields);
}
