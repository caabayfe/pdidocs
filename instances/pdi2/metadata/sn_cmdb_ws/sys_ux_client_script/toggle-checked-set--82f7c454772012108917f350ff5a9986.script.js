/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    let template = JSON.parse(JSON.stringify(api.state.template)); 
    
    // currently only used by one component 
    if(event.elementId == 'use_script_toggle')
        template.advanced = event.payload.value;

    api.setState('template', template);
    api.setState('isDirty', true);
        
}
