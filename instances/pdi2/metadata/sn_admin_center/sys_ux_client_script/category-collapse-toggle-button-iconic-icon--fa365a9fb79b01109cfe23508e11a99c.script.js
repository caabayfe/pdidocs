/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let isCollapsed = true;
    if (api.state.categoryCollapseStatus) {
        let collapseStatus = JSON.parse(api.state.categoryCollapseStatus);
        isCollapsed = collapseStatus[api.item.value.maturity];
    }

    return isCollapsed ? 'chevron-down-outline' : 'chevron-up-outline';
}
