/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var response = api.data.transform_driver_table_stats.output && api.data.transform_driver_table_stats.output.driverTableRows;
    var searchText = api.state.driverTableSearchString;
    var count = 0;

    if(searchText.length) {
        searchText = searchText.toLowerCase();
        count = response.rows.filter(row => row.cells.table.value.toLowerCase().includes(searchText) || row.cells.table.tableName.toLowerCase().includes(searchText)).length;
    } else if (response && response.rows) {
        count = response.rows.length;
    }
    api.setState("driverTableRowCount", count);
}
