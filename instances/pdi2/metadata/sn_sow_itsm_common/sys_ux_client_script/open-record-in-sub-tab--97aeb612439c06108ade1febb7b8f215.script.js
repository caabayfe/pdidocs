/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var recordTable = event.context.item.value.table;
    var targetTable = recordTable === "incident"? recordTable : api.context.props.table;
    api.emit('NAV_ITEM_SELECTED', {
        "route": "record",
        "targetRoute": "current",
        "fields": {
            "table": targetTable,
            "sysId": event.context.item.value.sys_id
        }
    });
}
