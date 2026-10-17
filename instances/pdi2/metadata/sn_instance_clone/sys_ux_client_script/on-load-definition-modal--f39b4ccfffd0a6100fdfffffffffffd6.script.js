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
    var rowDefinitions = api.state.rowDefinitions;
    var columnDefinitions = api.state.columnDefinitions;
    var startIdx = api.state.pageIdx * 7;
    var rowData = {
        selectionEnabled: false,
        rows: []
    };
    rowData["rows"] = rowDefinitions.rows.slice(startIdx, startIdx + 7);
    api.setState("colData", columnDefinitions);
    api.setState("rowData", rowData);
    api.setState("totalRecords", rowDefinitions.rows.length);
    api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
        loading: false,
        action: null,
        nonBlocking: false
    });
}
