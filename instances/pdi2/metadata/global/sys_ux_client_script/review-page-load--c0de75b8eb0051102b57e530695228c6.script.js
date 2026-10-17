/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const payload = JSON.parse(api.context.props.field.value) || {};
    api.setState("recordId", payload.sysId);
}
