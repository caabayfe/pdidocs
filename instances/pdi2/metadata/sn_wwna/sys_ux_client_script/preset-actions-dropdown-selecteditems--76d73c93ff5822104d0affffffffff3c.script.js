/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let actions = api.state.selectedButtonConfig.props.preset_actions;
    if (Array.isArray(actions)) {
        return actions;
    } else {
        return ([]);
    }
}
