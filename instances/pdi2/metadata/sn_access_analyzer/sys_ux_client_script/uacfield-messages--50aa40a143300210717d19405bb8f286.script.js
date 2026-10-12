/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.compareAccessTab.showMandatoryError && api.state.compareAccessTab.uacField.hasError) {
        return [{
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": api.state.translatedMessages.fieldTypeaheadAlert
        }];
    }
    return [];
}
