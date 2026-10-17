/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const {
        emit
    } = api;
    const customPayload = {
        "route": "record",
        "targetRoute": "current",
        "fields": {
            table: event.payload.table,
            sysId: event.payload.sys_id
        },
        "title": event.payload.row.rowData.value.get('name').columnData.displayValue
    };
    
    emit('NAV_ITEM_SELECTED', customPayload);
}
