/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var label = api?.item?.value?.header?.label;
    return {
        "button": {
            "aria-label": label
        }
    };
}
