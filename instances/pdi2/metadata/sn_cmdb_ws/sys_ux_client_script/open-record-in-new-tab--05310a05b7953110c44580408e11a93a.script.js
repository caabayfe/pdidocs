/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        emit
    } = api;

    const title = event.payload.row.rowData.value?.get('ci') ? event.payload.row.rowData.value.get('ci').columnData.displayValue : event.payload.row.rowData.value?.get('related_entry_ci').columnData.displayValue;
    const customPayload = {
        "route": "record",
        "targetRoute": "current",
        "fields": {
            table: event.payload.table,
            sysId: event.payload.sys_id
        },
        "title": title
    };
    
    emit('NAV_ITEM_SELECTED', customPayload);
}
