/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selected_mid_servers.length > 0) return helpers.translateSync("There is no data available for the selected criteria.");
    return helpers.translateSync("Select from the left side panel which server you would like to view data for.");
}
