/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var title = api.item.value.title;
    var description = api.item.value.description;
    return {
        "button": {
            "aria-label": title
        },
        "article": {
            "aria-label": description
        }
    };
}
