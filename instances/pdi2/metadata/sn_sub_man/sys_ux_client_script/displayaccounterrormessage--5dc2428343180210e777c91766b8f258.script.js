/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {        
    api.setState('showAccountErrorMessage', !api.state.showErrorMessage);
    api.setState('accountErrorMessage', event.payload.errors[0].split('(')[0]);    
}
