/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    let deleteActions = [...api.state.deleteActions];
    deleteActions.splice(event.context.item.index, 1);
    if (deleteActions.length == 0)
        deleteActions.push({
            "element": "",
            "element_label": "",
            "value": "",
            "display": ""
        });
    api.setState('deleteActions', deleteActions);
    api.setState('isDirty', true);
}
