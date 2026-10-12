/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    /*
     * Using a script rather than trying to fuss with a formula because the
     * return type here is a JSON object.
     */
    return {
        // this is the alert button type, always "open"
        type: "open",
        // destination of the button link, from the repeated hook value
        href: api.item.value.hookPayload.actions[0].url,
        // text of the button, from the repeated hook value
        label: api.item.value.hookPayload.actions[0].buttonText,
    };
}
