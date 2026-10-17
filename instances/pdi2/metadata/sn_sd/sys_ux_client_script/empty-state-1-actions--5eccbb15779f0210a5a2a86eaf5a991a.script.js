/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
        "configAria": {
            "aria-label": helpers.translateSync("Click here to open Operational dashboard documentation")
        },
        "icon": "open-link-fill",
        "label": helpers.translateSync("Open Operational dashboard documentation"),
        "tooltipContent": helpers.translateSync("Click here to open Operational dashboard documentation")
    }];
}
