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
            "aria-label": helpers.translateSync("Click here to open Success Dashboard documentation")
        },
        "icon": "open-link-fill",
        "label": helpers.translateSync("Open Success Dashboard documentation"),
        "tooltipContent": helpers.translateSync("Click here to open Success Dashboard documentation")
    }];
}
