/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(!api.state.emailValidationStatus.value || !api.state.emailSentValue) {
        console.log(api.state.emailValidationStatus.value);
        api.setState('emailValidationStatus', {value:false, timestamp:Date.now()});
    } else {
        api.setState('emailSentValue', false);
    }
}
