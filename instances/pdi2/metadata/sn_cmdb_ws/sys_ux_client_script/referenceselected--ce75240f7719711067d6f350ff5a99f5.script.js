/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let deleteActions = [...api.state.deleteActions];
    let referenceIndex = api.state.referenceIndex;
    deleteActions[referenceIndex].value = event.payload.row.sys_id.value;
    deleteActions[referenceIndex].display = event.payload.row.displayValue.value;
    api.setState('deleteActions',deleteActions);
    api.setState('isDirty', true);
   
}
