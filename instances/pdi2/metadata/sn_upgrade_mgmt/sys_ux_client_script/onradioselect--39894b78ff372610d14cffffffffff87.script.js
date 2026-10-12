/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedOption = event.payload.value;
    api.setState('selectedRadio', selectedOption);
    
    if(selectedOption !== 'true'){
        api.setState('hideNewCard', true);
        api.setState('hideExistingCard', false);
    } else {
        api.setState('hideNewCard', false);
        api.setState('hideExistingCard', true);
    }
}
