/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    helpers.translate("Please select a user").then(label => api.state.translatedMessages.userTypeaheadAlert = label);
    helpers.translate("Please select a table").then(label => api.state.translatedMessages.tableTypeaheadAlert = label);
    helpers.translate("Please select a valid field").then(label => api.state.translatedMessages.fieldTypeaheadAlert = label);
    helpers.translate("Please select a valid record").then(label => api.state.translatedMessages.recordTypeaheadAlert = label);
}
