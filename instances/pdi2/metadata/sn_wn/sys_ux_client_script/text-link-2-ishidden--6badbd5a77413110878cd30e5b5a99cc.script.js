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
    if(!api.item.value.documentation) 
        return true;
    for (var i = Math.min(s.length, 500); i < s.length && s[i] != '.'; i++);
    if (i == s.length) return false;
    return api.item.value.minimizedText;
}
