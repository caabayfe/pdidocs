/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit("NOW_RECORD_LIST_CONNECTED#VIEW_ALL_CLICKED", api?.data?.list_controller_3?.current);
}
