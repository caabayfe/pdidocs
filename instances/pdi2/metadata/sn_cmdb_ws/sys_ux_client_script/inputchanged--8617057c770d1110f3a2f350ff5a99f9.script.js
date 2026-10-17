/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let elementId = event.elementId; 
    let query = JSON.parse(JSON.stringify(api.state.query));
    
    if(elementId === 'input_name')
        query.name = event.payload.fieldValue;
    
    if(elementId === 'textarea_description')
        query.description = event.payload.fieldValue;
    
    api.setState('query',query);
    api.setState('isDirty', true);
    api.emit('CHECK_FORM_STATUS');
}
