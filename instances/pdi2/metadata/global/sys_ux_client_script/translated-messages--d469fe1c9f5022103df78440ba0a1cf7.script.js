/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("Record updated successfully.").then(label => api.state.translatedMessages.successfulUpdateMessage = label);
    helpers.translate("The following property is currently disabled: 'glide.oauth.inbound.client.credential.grant_type.enabled'. This is required for the client credential grant to work.").then(label => api.state.translatedMessages.ccPropertyDisabled = label);
    helpers.translate("Enter a service provider to continue with integration.").then(label => api.state.translatedMessages.providerRequired = label);
    helpers.translate("For client credential grants to work, property 'glide.oauth.inbound.client.credential.grant_type.enabled' must be defined and set to true.").then(label => api.state.translatedMessages.ccPropertyDisabled = label);
    api.state.translatedMessages.scopeRestriction = {};
    helpers.translate("Broadly scoped").then(label => api.state.translatedMessages.scopeRestriction["broadlyScopedLabel"] = label);
    helpers.translate("Useraccount scoped").then(label => api.state.translatedMessages.scopeRestriction["useraccountScopedLabel"] = label);
    helpers.translate("Securely scoped").then(label => api.state.translatedMessages.scopeRestriction["securelyScopedLabel"] = label);
    helpers.translate("Restrict this client's access exclusively to APIs within the designated scopes by enabling the 'Allow access only to APIs in selected scope' option. This client has access to APIs which are not associated to any scope.").then(label => api.state.translatedMessages.scopeRestriction["broadlyScopedWarning"] = label);
    helpers.translate("Assign only non-sensitive API scopes to reduce security risks. This integration currently has access to the useraccount scope.").then(label => api.state.translatedMessages.scopeRestriction["useraccountScopedWarning"] = label);

}
