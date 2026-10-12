/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Create copy of coverageClasses array. Required to forece update of repeater.
    let coverageClasses = api.state.coverageClasses.map((x) => x);
    coverageClasses.splice(event.context.item.index,1);
    api.setState('coverageClasses', coverageClasses);    
    api.setState('isDirty',true);
}
