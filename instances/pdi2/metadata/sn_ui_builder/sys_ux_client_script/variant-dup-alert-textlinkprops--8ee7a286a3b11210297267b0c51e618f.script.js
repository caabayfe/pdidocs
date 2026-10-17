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
        // always "Learn more"
        label: helpers.translateSync("Learn more"),
        // icon selection from Figma
        iconEnd: 'open-link-right-outline',
        // from the repeated hook payload
        href: api.item.value.hookPayload.learnMoreUrl,
    };
}
