/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const result = api.data.look_up_unconfirmed_user_property.result;
    if (!result || result.length == 0) {
        api.setState('unconfirmed_user_flow_enabled', false);
        return;
    }
    
    //Convert string to boolean
    const isEnabled = result.value.value.toLowerCase() == 'true';
    api.setState('unconfirmed_user_flow_enabled', isEnabled);
}
