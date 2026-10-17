/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("Select one or more APIs for the scope.").then(label => api.state.translatedMessages["noAPIsAssociatedWarning"] = label);
    helpers.translate("This scope grants access to all resources available to signed-in user and not recommended for general use.").then(label => api.state.translatedMessages["useraccountScopeSelected"] = label);
}
