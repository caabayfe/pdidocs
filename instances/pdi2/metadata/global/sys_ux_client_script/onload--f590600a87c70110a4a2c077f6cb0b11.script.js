/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const details = api.context.props.payload.props_details;
    api.setState("tableName", details.table_name);
    api.setState("query_1", details.encoded_query);
}
