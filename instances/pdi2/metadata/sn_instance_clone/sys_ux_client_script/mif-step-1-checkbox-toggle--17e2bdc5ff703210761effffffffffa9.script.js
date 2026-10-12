/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var multiInstanceParam = JSON.parse(JSON.stringify(api.state.multiInstanceView));
    if(event.payload.value) {
        multiInstanceParam.step1NextButtonDisable = false;
        multiInstanceParam.trusteeInstance = 'Current Instance';
    } else {
        multiInstanceParam.step1NextButtonDisable = true;
        multiInstanceParam.trusteeInstance = '';
    }
    
    api.setState('multiInstanceView', multiInstanceParam);
}
