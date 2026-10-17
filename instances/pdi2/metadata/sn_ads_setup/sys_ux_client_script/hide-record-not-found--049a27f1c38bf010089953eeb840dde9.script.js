/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (
        api.data.get_setup_info.items &&
        (
            api.data.get_setup_info.items.length === 0 ||
            api.data.get_setup_info.result.type.value !== 'global_setup'
        )
    ) {
        api.setState('hideRecordNotFound', false);   
    } else {
        const {name, status, checklist, process_definition} = api.data.get_setup_info.result;
        api.setState('setupName', process_definition._reference.label.displayValue);
        api.setState('status', status.displayValue);  
        api.setState('checklist', checklist.displayValue); 
    }
}
