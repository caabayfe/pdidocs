/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.state.defaultFirstDate || !api.state.defaultSecondDate) {
        api.setState('disableCompare', true);
    } else {
        api.setState('disableCompare', event.payload.value);
    }
}
