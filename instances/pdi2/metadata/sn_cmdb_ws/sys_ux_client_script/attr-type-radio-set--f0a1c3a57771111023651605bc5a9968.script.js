/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let dataMismatchClasses = api.state.dataMismatchClasses.map((x) => x);
    dataMismatchClasses[event.context.item.index].condition_type = event.payload.value;
    api.setState('dataMismatchClasses', dataMismatchClasses);   
    api.setState('isDirty',true);  

}
