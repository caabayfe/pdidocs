/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 if (
        api.data.get_setup_info.result &&
            api.data.get_setup_info.result.type.value !== 'global_setup'
    ) {
        api.setState('hideRecordNotFound', false);   
    } else {
        const {status, process_definition} = api.data.get_setup_info.result;
        api.setState('setupName', process_definition._reference.label.displayValue);
        api.setState('setupStatus', status.displayValue);  
    }
}
