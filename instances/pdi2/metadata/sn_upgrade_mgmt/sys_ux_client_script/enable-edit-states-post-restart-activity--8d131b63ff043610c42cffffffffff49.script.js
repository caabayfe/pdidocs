/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("showEditLoading",false);
    api.setState("disableEdit", true);
    api.setState("activityState", "IN_PROGRESS");
    api.setState("columnData", api.state.defaultColumnData);
}
