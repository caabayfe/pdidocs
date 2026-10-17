/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        message
    } = api.state.translation;
    var output = api.data.single_funnel_data.output;
    if (output) {
        const {
            funnelName
        } = output;
        return message.replace('{0}', funnelName);
    }
    return message;
}
