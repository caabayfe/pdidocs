/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    /**
     * Syncing params value with the home tab index
     */
    const homeTabs = {
        'overview': 0,
        'subscriptions': 1,
        'issues': 2,
        'insights': 3,
        'settings': 4
    };
    const selectedTabIndex = (api.context.props.sm == '') ? 0 : homeTabs[api.context.props.sm];
    return selectedTabIndex;
}
