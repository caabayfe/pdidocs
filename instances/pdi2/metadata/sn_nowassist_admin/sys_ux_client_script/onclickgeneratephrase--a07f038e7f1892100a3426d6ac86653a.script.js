/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.elementId === "button_3"){
        api.setState("isLoading", true);
        api.setState("allSelected",false);
    }
    else if(event.elementId === "select_1"){
        api.setState("phrasesNumber", event.payload.value);
    }
    
}
