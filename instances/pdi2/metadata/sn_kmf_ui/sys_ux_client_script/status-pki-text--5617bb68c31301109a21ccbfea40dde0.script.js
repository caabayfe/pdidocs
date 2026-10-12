/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var currentPki = api.state.config.currentPki;
    if (!currentPki)
        return helpers.translateSync("This instance isn't configured to use any PKI.");
    return helpers.translateSync('This instance is currently configured to use {0} as a PKI.', currentPki);
}
