/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { copyToClipboard } = imports["global.APIAuthenticationConsoleUtil"]();
    let client_secret = api.state.formFieldAndValues.client_secret;
    let successMessage = await helpers.translate("Client secret copied to clipboard.");
    let failureMessage = await helpers.translate("Failed to copy Client secret to clipboard.");
    copyToClipboard("client_secret", client_secret, successMessage, failureMessage, api, helpers);
}
