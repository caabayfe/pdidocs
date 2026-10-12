/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        state,
        context: {
            props
        }
    } = api;
    return props.isSendToInvalid ? [{
        content: helpers.translateSync("Send to field is mandatory"),
        status: "critical",
        icon: "circle-info-outline"
    }] : [];
}
