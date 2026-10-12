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
    var benchmarksUtils = imports['sn_benchmarks.BenchmarksUtils']();
    if (api.state.pageIndexListView != event.payload.value) {
        var pageIndex = Number(event.payload.value);
        api.setState("pageIndexListView", pageIndex);
        benchmarksUtils.setDataForList(api, api.state.overviewDataList, pageIndex);
    }
}
