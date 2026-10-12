/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var inputs = api.state.inputs;
    inputs[event.elementId] = event.payload.value;
    inputs.newValues = true;
    api.setState('inputs', inputs);
    api.emit('SCREEN_STATUS_CHANGED', {
        isDirty: true
    });
}
