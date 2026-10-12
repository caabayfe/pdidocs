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
    if (api.state.pageIndex != event.payload.value) {
        var pageIndex = Number(event.payload.value);
        api.setState("pageIndex", pageIndex);

        var pageSize = api.state.pageSize;
        var startingIndex = pageIndex * pageSize;
        var indicatorDataLength = api.state.overviewData.indicatorData.length;
        var endingIndex = (pageIndex + 1) * pageSize;
        if (indicatorDataLength < endingIndex) {
            endingIndex = indicatorDataLength;
        }
        api.setState("indexedData", api.state.overviewData.indicatorData.slice(startingIndex, endingIndex));

    }
}
