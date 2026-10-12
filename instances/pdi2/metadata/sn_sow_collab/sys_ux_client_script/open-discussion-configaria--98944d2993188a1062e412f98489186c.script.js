/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let title = api.item.value.title;
    return {
        "button": {
            "aria-label": helpers.translateSync("Button: Open discussion for {0}", title)
        }
    };
}
