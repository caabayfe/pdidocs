/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { cell: { metadata: { openRecordMetadata: {table, sysId, displayValue} }}} = event.payload;
    api.setState("navigationPayload", {table, sysId, displayValue});
    api.data.resolve_route_parent_tables_1.refresh();
}
