/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var gridAriaLabel = helpers.translateSync("View information in grid mode");
    var ariaChecked = api.state.gridViewSelected ? "true" : "false";
    return {
        "button": {
            "aria-checked": ariaChecked,
            "aria-label": gridAriaLabel,
            "role": "radio"
        }
    };

}
