/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Filter only checked instances
    const selected = api.state.instances.filter(item => item.checked);
    
    // Store selected instances
    api.setState('selectedInstances', selected);
    
    // Move to next step
    api.setState('stepContainer', 1);
}
