/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedOption = event.payload.value;
    api.setState('cardNew', false);
    api.setState('cardExisting', true);
    if(selectedOption){
        api.setState('hideNewCard', true);
        api.setState('hideExistingCard', false);
    }
    api.setState('selectedRadio', 'false');
}
