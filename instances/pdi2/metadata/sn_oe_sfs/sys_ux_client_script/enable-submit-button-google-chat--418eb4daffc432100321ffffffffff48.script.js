/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {name, value, fieldValue} = event.payload;

    if(!value && !isEmpty(api.state.google_chat_bot_name) && !isEmpty(api.state.inbound_service_account_email) && !isEmpty(api.state.outbound_service_account_email) && !isEmpty(api.state.private_key_password) && api.state.hasAttachments)
        api.setState('buttonDisabled',false);
    else 
        api.setState('buttonDisabled',true);  

    function isEmpty(str){
        return str === null || str.match(/^ *$/) !== null;
    }
}
