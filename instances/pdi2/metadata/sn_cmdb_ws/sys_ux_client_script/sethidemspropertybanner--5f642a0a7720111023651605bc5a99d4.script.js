/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.data.ms_property_enabled.output) {
        api.setState('hidePropertyEnabledBanner',true);
    } else {
        api.setState('hidePropertyEnabledBanner',false);
    }
     
}
