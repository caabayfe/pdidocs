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

    var columns = columnDefs.columns;
    if (!columns) return [];

    var len = columns.length;

    if (len > 0) {
        columns[0].label = helpers.translateSync('Setup Configuration');
    }
    if (len > 1) {
        columns[1].label = helpers.translateSync('Application');
    }

    // Removing setup_execution_type and hui_sys_domain and hui_sys_id column from list view.
    var count = 3;
    while (count--) {
        if (columns.length > 0) {
            columns.pop();
        }
    }

    return columnDefs;
}
