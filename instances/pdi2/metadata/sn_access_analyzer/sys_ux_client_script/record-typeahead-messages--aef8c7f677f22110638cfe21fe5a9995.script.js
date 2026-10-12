/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.showMandatoryError && api.state.recordTypeahead.hasError) {
        return [{
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": api.state.translatedMessages.recordTypeaheadAlert
        }];
    }
    return [];
}
