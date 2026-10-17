/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var detailsCurrentSelectionInfo = api.state.detailsCurrentSelectionInfo;
    detailsCurrentSelectionInfo.indicatorId = event.payload.indicatorId;
    detailsCurrentSelectionInfo.indicatorName = event.payload.indicatorName;
    api.setState("detailsCurrentSelectionInfo", detailsCurrentSelectionInfo);
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_1',
        route: 'benchmarks-details',
        fields: null,
        params: null
    });
    api.setState("overviewIsLoaded", false);
}
