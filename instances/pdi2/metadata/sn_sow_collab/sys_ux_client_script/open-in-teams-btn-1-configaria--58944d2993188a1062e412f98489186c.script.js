/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let title = api.item.value.topic;
    return {
        "button": {
            "aria-label": helpers.translateSync("Button: Open in Microsoft Teams for {0}", title)
        }
    };
}
