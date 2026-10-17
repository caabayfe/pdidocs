/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let deleteActions = [...api.state.deleteActions];
    deleteActions[event.context.item.index].value = event.payload.fieldValue;
    deleteActions[event.context.item.index].display = event.payload.fieldValue;
    api.setState('deleteActions',deleteActions);
    api.setState('isDirty', true);
    
}
