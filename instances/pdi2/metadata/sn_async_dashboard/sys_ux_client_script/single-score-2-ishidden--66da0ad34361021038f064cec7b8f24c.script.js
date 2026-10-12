/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.queue == undefined)
        return false;
    return api.state.state_should_show_processing_framework_widgest && api.state.state_is_processing_framework_enabled;
}
