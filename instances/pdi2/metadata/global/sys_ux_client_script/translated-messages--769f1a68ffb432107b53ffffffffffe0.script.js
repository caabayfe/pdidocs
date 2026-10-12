/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("Auth scope already selected, please change selection.").then(label => api.state.translatedMessages.authscope = label);
    helpers.translate("New auth scope created.").then(label => api.state.translatedMessages.successNewAuthScope = label);
    helpers.translate("Auth scope with same name already exists.").then(label => api.state.translatedMessages.existingNewAuthScope = label);
    helpers.translate("Failed to create new auth scope.").then(label => api.state.translatedMessages.failedNewAuthScope = label);
}
