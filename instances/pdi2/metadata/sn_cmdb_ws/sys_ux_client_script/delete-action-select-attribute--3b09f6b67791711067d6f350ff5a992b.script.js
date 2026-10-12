/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let deleteActions = [...api.state.deleteActions];
    deleteActions[event.context.item.index].element = event.payload.value;
    deleteActions[event.context.item.index].element_label = event.payload.item.label;
    deleteActions[event.context.item.index].attribute = event.payload.item;
    deleteActions[event.context.item.index].value = event.payload.value == "boolean" ? true : "";
    deleteActions[event.context.item.index].display = event.payload.value == "boolean" ? "true" : "";
    api.setState('deleteActions',deleteActions);
    api.setState('isDirty', true);

}
