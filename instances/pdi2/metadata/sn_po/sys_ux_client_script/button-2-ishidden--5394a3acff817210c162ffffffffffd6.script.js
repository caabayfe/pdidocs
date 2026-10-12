/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.isPlaybookProject ||
        api.state.compare_mode_on ||
        (api.context.props.selectedTab != api.state.TAB_ITEMS.ANALYST_WORKBENCH);
}
