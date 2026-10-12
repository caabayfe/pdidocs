/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('internalProperties', api.context.props.field._internalObj);
    if(api.context.props.field.value)
        api.setState('payload', JSON.parse(api.context.props.field.value));
    api.setState("readonly", api.context.props.field.readonly == "true");
}
