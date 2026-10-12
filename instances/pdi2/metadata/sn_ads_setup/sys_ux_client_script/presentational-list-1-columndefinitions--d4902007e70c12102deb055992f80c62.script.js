/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var columnDefs = api?.data?.list_controller?.columnDefinitions;
    if (!columnDefs) return [];

    var columns = columnDefs?.columns;
    if (!columns) return [];

    var len = columns.length;
    if (len > 0)
        columns[0].label = helpers.translateSync('Configuration');
    if (len > 2) {
        columns[2].label = helpers.translateSync('Status');
        columns[2].type = 'string';
    }
    // Remove hui_sys_domain column from list view.
    columns.pop();
    return columnDefs;
}
