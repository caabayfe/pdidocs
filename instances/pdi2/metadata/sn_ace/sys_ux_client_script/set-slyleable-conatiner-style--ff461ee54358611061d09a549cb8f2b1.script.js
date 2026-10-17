/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.app.view_full_screen) {
        return {
            "width": "100%",
            "overflow":"none"
        };
    }
    return {
        "max-width": "1920px",
        "margin": "auto"
    };
}
