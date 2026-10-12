/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('internalProperties', api.context.props.field._internalObj);
    const payload = JSON.parse(api.context.props.field.value);
    api.setState('payload', payload);
    api.setState('toggleChecked', (payload.sla === "1" || payload.sla));
    api.setState('readonly', api.context.props.field.readonly == "true");
}
