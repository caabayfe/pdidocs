/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const {name, value, fieldValue} = event.payload;
    if(!value && !isEmpty(api.state.messenger_bot_name) && !isEmpty(api.state.inbound_id) && !isEmpty(api.state.app_id) && !isEmpty(api.state.messenger_hash_secret) && !isEmpty(api.state.messenger_access_token)) {
        api.setState('buttonDisabled',false);
    }
    else 
        api.setState('buttonDisabled',true);   
    function isEmpty(str){
        return str === null || str.match(/^ *$/) !== null;
    }
}
