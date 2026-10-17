/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var input = event.payload.fieldValue;
    
    if(!isNaN(input)){
         api.setState('invalid_number_minutes', false);
    }else{
         api.setState('invalid_number_minutes', true);
    }  
}
