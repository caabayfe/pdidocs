/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var listAriaLabel = helpers.translateSync("View information in list mode");
    var ariaChecked = api.state.gridViewSelected ? "false" : "true";
    return {
        "button": {
            "aria-checked": ariaChecked,
            "aria-label": listAriaLabel,
            "role": "radio"
        }
    };

}
