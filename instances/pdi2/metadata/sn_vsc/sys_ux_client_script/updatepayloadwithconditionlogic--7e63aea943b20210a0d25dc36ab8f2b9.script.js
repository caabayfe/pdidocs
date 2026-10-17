/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let value = event?.payload?.value;
    if (value && value.length && value[0]) {
        value = value[0];
        api.setState('conditionLogicFromUI', value);
    }
}
