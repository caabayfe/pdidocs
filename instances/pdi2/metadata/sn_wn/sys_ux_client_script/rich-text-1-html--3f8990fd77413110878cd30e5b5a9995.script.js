/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var s = api.item.value.text;
    if(!s) 
        return s;
    for (var i = Math.min(s.length - 1, 500); i < s.length && s[i] != '.'; i++);
    return api.item.value.minimizedText ? s.substring(0, i + 1) : s;
}
