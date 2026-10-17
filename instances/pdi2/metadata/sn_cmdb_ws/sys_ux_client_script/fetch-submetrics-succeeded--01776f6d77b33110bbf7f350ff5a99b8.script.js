/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let output = event.payload.data.output;
    api.setState('tabCards',output);
    api.emit('VERIFY_SCORES');
}
