/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.categoryCollapseStatus) {
        let collapseStatus = JSON.parse(api.state.categoryCollapseStatus);
        return collapseStatus[api.item.value.maturity];
    } else
        return true;
}
