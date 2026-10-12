/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var response = api.data.transform_driver_table_stats.output;
    if(!(response && response.driverTableRows && response.driverTableRows.rows)) 
        return [];
    
    var rows = response.driverTableRows.rows;
    var searchText = api.state.driverTableSearchString || '';
    
    // If searchtext is not empty, apply search
    if(searchText.length) {
        searchText = searchText.toLowerCase();
        rows = rows.filter(row => row.cells.table.value.toLowerCase().includes(searchText) || row.cells.table.tableName.toLowerCase().includes(searchText));
    }

    var currentPage = api.state.driverTablePaginationCurrentPage;
    var rowsPerPage = api.state.driverTablePaginationRowsPerPage;

    var startIndex = currentPage * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, rows.length);

    return {
        rows: rows.filter((obj, index) => {
            return index >= startIndex && index < endIndex;
        })
    };
}
