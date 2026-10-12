/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("Record created successfully.").then(label => api.state.translatedMessages.successfulCreateMessage = label);
    helpers.translate("Invalid URL, please enter a valid URL.").then(label => api.state.translatedMessages.invalidURL = label);
    helpers.translate("Client secret copied to clipboard.").then(label => api.state.translatedMessages.clientSecretCopySuccess = label);
    helpers.translate("Failed to copy Client secret to clipboard.").then(label => api.state.translatedMessages.clientSecretCopyFailed = label);
}
