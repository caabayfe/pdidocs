/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let deleteActions = [...api.state.deleteActions];
    deleteActions.push({
        "element": "",
        "element_label": "",
        "value": "",
        "display": ""
    });
    api.setState('deleteActions', deleteActions);
    api.setState('isDirty', true);
}
