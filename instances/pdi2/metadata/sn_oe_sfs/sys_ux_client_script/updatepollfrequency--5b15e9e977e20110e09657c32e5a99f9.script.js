/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const newVal = event.payload.fieldValue;
    let updatedVal = newVal ? newVal : api.data.lookup_poll_frequency.result.value.value;
    api.setState('poll_frequency',updatedVal);
}
