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
            "aria-label": helpers.translateSync("Open benchmarks opt-in page")
        },
        "icon": "open-link-fill",
        "label": helpers.translateSync("Set up Benchmarks"),
        "tooltipContent": helpers.translateSync("Open benchmarks opt-in page"),
        "variant": "primary"
    }];
}
