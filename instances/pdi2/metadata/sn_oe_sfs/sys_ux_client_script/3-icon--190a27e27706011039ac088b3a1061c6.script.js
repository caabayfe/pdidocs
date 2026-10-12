/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let currentScreenData = api.state.currentScreenData;
    if (currentScreenData) {
        if (api.state.activeScreen == 3)
            return 'circle-fill';
        else
            return 'circle-outline';
    }
}
