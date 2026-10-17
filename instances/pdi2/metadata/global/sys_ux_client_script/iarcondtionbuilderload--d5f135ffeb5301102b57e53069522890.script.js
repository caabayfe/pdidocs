/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const payload = JSON.parse(api.context.props.field.value);
    api.setState("tableName", payload.tableName);
    api.setState("query", payload.query);
    api.setState("readonly", api.context.props.field.readonly == "true");
    api.setState("displayQuery", payload.displayQuery);
}
