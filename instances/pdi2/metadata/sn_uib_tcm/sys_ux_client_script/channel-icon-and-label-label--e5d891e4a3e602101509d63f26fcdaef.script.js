/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let label = api.item.value.comm_channel_config.display_value;
    if (api.item.index != api.state.commTaskDetails.channels.length - 1) {
        label += ",";
    }
    return label;
}
