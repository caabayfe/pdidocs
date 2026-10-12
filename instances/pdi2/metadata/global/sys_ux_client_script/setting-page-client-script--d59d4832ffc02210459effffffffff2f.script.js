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
    const micClient = imports["global.MICClient"](api, helpers);

    if (event.name == "MACROPONENT_READY" && !micClient.isApplicationEnabled()) {
        micClient.redirectToHomePage();
    }
}
