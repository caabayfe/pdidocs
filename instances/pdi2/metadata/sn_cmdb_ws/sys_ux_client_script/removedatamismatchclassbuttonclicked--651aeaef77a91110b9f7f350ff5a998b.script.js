/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Create copy of dataMismatchClasses array. Required to forece update of repeater.
    let dataMismatchClasses = api.state.dataMismatchClasses.map((x) => x);
    dataMismatchClasses.splice(event.context.item.index,1);
    api.setState('dataMismatchClasses', dataMismatchClasses);    
    api.setState('isDirty',true);
}
