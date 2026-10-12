/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const sysPropResult = api.data.lookup_show_message.result;
    if(!api.data.lookup_show_message.result || Object.keys(sysPropResult).length === 0){
        api.setState('show_message_preview',true);
    }
    const sysPropValue = sysPropResult.value.value.trim().toLowerCase();
    const showMessagePreview = sysPropValue === 'true';
    api.setState('show_message_preview',showMessagePreview);
}
