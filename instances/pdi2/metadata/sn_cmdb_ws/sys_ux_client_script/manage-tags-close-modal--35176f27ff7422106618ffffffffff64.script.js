/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.modal.close("manage_tags_modal");
    api.setState("manageTags", []);
    api.setState("tagsRefresh", {"timestamp" : Date.now()});
}
