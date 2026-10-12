/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.name == "t" && event.payload.previousValue) {
        api.data.ci_gs_plugins_status_1.refresh();
        api.data.ace_fetch_content_blocks.refresh();
    }
}
