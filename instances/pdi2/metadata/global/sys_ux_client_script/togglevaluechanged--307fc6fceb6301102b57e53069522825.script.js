/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const val = JSON.stringify({
        sla: event.payload.value
    });
    api.setState('toggleChecked', event.payload.value);
    api.emit('MACROPONENT_VALUE_CHANGED', {
        value: val
     });
}
