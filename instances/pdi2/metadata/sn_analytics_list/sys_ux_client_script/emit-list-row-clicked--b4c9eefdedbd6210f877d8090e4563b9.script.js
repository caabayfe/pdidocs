/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const table = api.data?.resolve_route_parent_tables_1?.output?.table || api.state?.navigationPayload?.table;
    const sys_id = api.data?.resolve_route_parent_tables_1?.output?.sysId || api.state?.navigationPayload?.sysId;
    const title = api.data?.resolve_route_parent_tables_1?.output?.title || api.state?.navigationPayload?.displayValue;
    const componentPayload = {
        table,
        row: {sys_id: {value: sys_id}},
        sys_id,
        title,
        listTitle: title
    };
    api.emit("NOW_RECORD_LIST_CONNECTED#ROW_CLICKED", componentPayload);
}
