/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.customSelectedItems && api.state.customSelectedItems.length == 0) {
        return [];
    } else if (api.item.value.showMaximumFnGroupError) {
        return [{
            status: "critical",
            icon: "circle-info-outline",
            content: "Only one selection of functional group is allowed."
        }];
    }
}
