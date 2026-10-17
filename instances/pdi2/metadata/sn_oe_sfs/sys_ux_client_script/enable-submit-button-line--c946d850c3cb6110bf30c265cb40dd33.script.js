/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const {name, value, fieldValue} = event.payload;
    if(!value && !isEmpty(api.state.line_bot_name) && !isEmpty(api.state.line_hash_secret) && !isEmpty(api.state.line_access_token)) {
        api.setState('buttonDisabled',false);
    }
    else 
        api.setState('buttonDisabled',true);   
    function isEmpty(str){
        return str === null || str.match(/^ *$/) !== null;
    }
}
