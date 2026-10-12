/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let messages = api.state.translatedMessaged;
    helpers.translate("Editing this configuration will impact other OAuth clients using the same OIDC provider configuration.").then(label => messages["editingOIDCProviderConfig"] = label);
    helpers.translate("Record created successfully.").then(label => messages["successfulCreateMessage"] = label);
    helpers.translate("The OIDC Configuration Cache Life Span should be between 1 and 720 hours.").then(label => messages["lifepsan_error"] = label);
}
