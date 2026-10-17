/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const status = api.data.single_funnel_data.output ?
        api.data.single_funnel_data.output.funnelStatus :
        null;
    if (status && ['Initializing', 'Updating', 'Pending'].indexOf(status) !== -1)
        return false; // show notification for these states
    return true; // hide otherwise
}
