/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.parent.value.slot) return;
    let title = "";
    if (api.item.value.title && api.item.value.title.original)
        title = helpers.translateSync("Card: {0}", api.item.value.title.original);
    return {
        "button": {
            "aria-label": title
        }
    };
}
