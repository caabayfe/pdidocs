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
    if(event.elementId == 'condtion_code_editor') {
        template.script = event.payload.text;
        let errorSeverity = event.payload.errors.filter((err) => err.severity == 'error');
        if(errorSeverity.length > 0)
            template.script = "";
    }
    api.setState('template', template);
    api.setState('isDirty', true);
}
