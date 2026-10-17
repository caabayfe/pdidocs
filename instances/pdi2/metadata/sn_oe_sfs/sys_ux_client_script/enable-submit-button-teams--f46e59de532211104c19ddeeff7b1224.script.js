/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {name, value, fieldValue} = event.payload;

    if(!value && !isEmpty(api.state.bot_name) && !isEmpty(api.state.tenant_id) && !isEmpty(api.state.client_id) && !isEmpty(api.state.client_secret))
        api.setState('buttonDisabled',false);
    else 
        api.setState('buttonDisabled',true);  

    function isEmpty(str){
        return str === null || str.match(/^ *$/) !== null;
    }
}
