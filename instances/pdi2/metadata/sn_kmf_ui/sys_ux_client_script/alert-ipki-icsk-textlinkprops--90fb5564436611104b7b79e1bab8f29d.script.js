/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var str = api.item.value;
    var pos = str.lastIndexOf("https");
    if (pos < 0)
        return '';
    var url = str.slice(pos);
    return {
        "label": "KB link.",
        "href": url,
        "target": "_blank"
    };
}
