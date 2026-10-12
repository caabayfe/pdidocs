/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.categoryWeightCollapseStatus) {
        let collapseStatus = JSON.parse(api.state.categoryWeightCollapseStatus);

        return collapseStatus[`${api.item.parent.value.maturity}-${api.item.value.weight}`];
    } else
        return true;
}
