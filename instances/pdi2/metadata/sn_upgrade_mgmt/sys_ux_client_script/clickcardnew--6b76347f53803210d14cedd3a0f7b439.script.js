/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedOption = event.payload.value;
    api.setState('cardExisting', false);
    api.setState('cardNew', true);
    if(selectedOption){
        api.setState('hideNewCard', false);
        api.setState('hideExistingCard', true);
    }
    api.setState('selectedRadio', 'true');
}
