/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const tabs = api.state.tabs;
    const selectedTab = api.context.props.selectedTabIndex;
    return tabs[selectedTab]['label'];
}
