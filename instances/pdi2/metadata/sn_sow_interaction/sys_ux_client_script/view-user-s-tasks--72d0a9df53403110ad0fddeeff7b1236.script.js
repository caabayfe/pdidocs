/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const openedForSysId = api.state.openedForSysId;
    const activeRecordsHeader = api.state.activeRecordsHeader;
    api.emit('NAV_ITEM_SELECTED', {
            title: activeRecordsHeader,
            route: 'simplelist',
            fields: {
                table: 'task'
            },
            params: {
                listTitle: activeRecordsHeader,
                query: "sys_class_name=incident^active=true^ref_incident.caller_id=" + openedForSysId + "^NQ" + "sys_class_name=problem^active=true^opened_by=" + openedForSysId + "^NQ" + "sys_class_name=change_request^active=true^ref_change_request.requested_by=" + openedForSysId + "^NQ" + "sys_class_name=sc_request^active=true^ref_sc_request.requested_for=" + openedForSysId + "^ORDERBYDESCsys_created_on"
            },
            targetRoute: 'current'
        });
}
