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
    var startIdx = api.state.pageIdx * 7;

    var rowData = {
        selectionEnabled: false,
        rows: []
    };

    if (event.name == "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET") {
        var searchTerm = api.state.searchTerm;
        if (!searchTerm) {
            rowData["rows"] = rowDefinitions.rows.slice(startIdx, startIdx + 7);
            api.setState("rowData", rowData);
            api.setState("totalRecords", rowDefinitions.rows.length);
        } else {
            for (let i = 0; i < rowDefinitions.rows.length; i++) {
                let row = rowDefinitions.rows[i];
                if (row.cells.row_name.value.toLowerCase().includes(searchTerm.toLowerCase())) {
                    rowData.rows.push(row);
                }
            };
            api.setState("rowData", {
                selectionEnabled: false,
                rows: rowData.rows.slice(startIdx, startIdx + 7)
            });
            api.setState("totalRecords", rowData.rows.length);
        }
    }
}
