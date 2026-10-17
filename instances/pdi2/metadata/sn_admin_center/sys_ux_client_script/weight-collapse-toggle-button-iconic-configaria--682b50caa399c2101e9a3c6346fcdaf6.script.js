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
    if (api.state.categoryWeightCollapseStatus) {
        let collapseStatus = JSON.parse(api.state.categoryWeightCollapseStatus);
        isCollapsed = collapseStatus[`${api.item.parent.value.maturity}-${api.item.value.weight}`];
    }

    let ariaLabelMsg = isCollapsed ? api.state.expandMessage : api.state.collapseMessage;
    return {
        "button": {
            "aria-label": `Optional apps accordion`,
            "aria-expanded": `${!isCollapsed}`,
        }
    };
}
