/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var currList = api.state.selected_mid_servers;
    if (!currList.includes(api.item.value)) return true;
    return false;
}
