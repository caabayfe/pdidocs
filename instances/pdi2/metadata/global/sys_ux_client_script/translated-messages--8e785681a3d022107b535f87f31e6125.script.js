/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let messages = api.state.translatedMessaged;
    helpers.translate("Only OAuth OIDC Entity records can be edited.").then(label => messages["failedInboundGrantTypeMatch"] = label);
    helpers.translate("Editing this configuration will impact other OAuth clients using the same OIDC provider configuration.").then(label => messages["editingOIDCProviderConfig"] = label);
    helpers.translate("The OIDC Configuration Cache Life Span should be between 1 and 720 hours.").then(label => messages["lifepsan_error"] = label);
    helpers.translate("Enter a service provider to continue with integration.").then(label => messages["providerRequired"] = label);

    messages["scopeRestriction"] = {};
    helpers.translate("Broadly scoped").then(label => messages.scopeRestriction["broadlyScopedLabel"] = label);
    helpers.translate("Useraccount scoped").then(label => messages.scopeRestriction["useraccountScopedLabel"] = label);
    helpers.translate("Securely scoped").then(label => messages.scopeRestriction["securelyScopedLabel"] = label);
    helpers.translate("Restrict this client's access exclusively to APIs within the designated scopes by enabling the 'Allow access only to APIs in selected scope' option. This client has access to APIs which are not associated to any scope.").then(label => messages.scopeRestriction["broadlyScopedWarning"] = label);
    helpers.translate("Assign only non-sensitive API scopes to reduce security risks. This integration currently has access to the useraccount scope.").then(label => messages.scopeRestriction["useraccountScopedWarning"] = label);
}
