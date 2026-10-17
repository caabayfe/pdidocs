/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const requestType = api.item.value.type;
    const requestNumber = api.item.value.number;
    return {
        "button": {
            "aria-label": helpers.translateSync("{0} Interaction: {1}", [requestType, requestNumber])
        }
    };
}
