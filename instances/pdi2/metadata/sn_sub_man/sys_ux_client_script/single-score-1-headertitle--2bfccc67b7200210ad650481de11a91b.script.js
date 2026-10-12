/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.isMeterTypeCreator ?
        helpers.translateSync("Account-level consumptions") :
        helpers.translateSync("Consumption summary");
}
