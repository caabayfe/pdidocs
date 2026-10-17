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

    var table = event.payload.table;
    if(table === "cmdb_multisource_data") {
        var ciSysId = event.payload.row.rowData.value.get("ci").columnData.value;
        var classTable = event.payload.row.rowData.value.get("class").columnData.value;
        var params = {};
        if(event.payload.row.rowData.value.get("diff_field"))
            params.search = event.payload.row.rowData.value.get("diff_field").columnData.value;
        
        if(ciSysId && classTable) {
            helpers.navigate.to('cmdb-360-multisource-data-preview',{'sys_id': ciSysId,'table':classTable}, params);
        }
    } else {
        const customPayload = {
            "route": "record",
            "targetRoute": "current",
            "fields": {
                table: table,
                sysId: event.payload.sys_id
            },
            "title": event.payload.title
        };
        
        emit('NAV_ITEM_SELECTED', customPayload);
    }
    

}
