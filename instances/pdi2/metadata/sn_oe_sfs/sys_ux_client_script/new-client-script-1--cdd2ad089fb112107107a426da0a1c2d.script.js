/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var workspace = api.data.get_dropdown_values_for_typeahead_1.output[0].children.find(child => child.label === event.payload.value);
    api.setState('displayToggle',false);
    if(workspace) {
        var queryCondition = "workspace="+workspace.id;  
        api.setState('workSpaceId', workspace.id); 
        api.setState('workSpaceLabel', workspace.label);
        api.setState('queryCondition', queryCondition); 
    } else {
        api.setState('workSpaceId', null);
        api.setState('workSpaceLabel', null);
        api.setState('queryCondition', "workspace="); 
    }
}
