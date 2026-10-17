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
    var startIdx = 0;

    var rowData = {
        //selectionEnabled: false,
        rows: []
    };
    
    /*if (event.name == "SN_SEARCH_COMBOBOX#SEARCH_EXECUTED" || event.name == "NOW_INPUT#ENTER_KEYDOWN" || event.name == "NOW_BUTTON_ICONIC#CLICKED") {
        var searchTerm = event.payload.searchTerm || event.payload.fieldValue || "";*/
    if (event.name == "NOW_INPUT#ENTER_KEYDOWN" || event.name == "NOW_BUTTON_ICONIC#CLICKED") {
        var searchTerm = event.payload.fieldValue || "";
        api.setState("searchTerm", searchTerm);
        var _searchTerm = JSON.parse(JSON.stringify(searchTerm));
        _searchTerm = _searchTerm.toLowerCase();
        if (!searchTerm) {
            rowData["rows"] = rowDefinitions.rows.slice(startIdx, startIdx + 7);
            api.setState("rowData", rowData);
            api.setState("totalRecords", rowDefinitions.rows.length);
        } else {
            for (let i = 0; i < rowDefinitions.rows.length; i++) {
                let row = rowDefinitions.rows[i];
                if (row.cells.row_name.value.toLowerCase().includes(_searchTerm)) {
                    rowData.rows.push(row);
                }
            }
            var _rowData = {
                selectionEnabled: false,
                rows: rowData.rows.slice(startIdx, startIdx + 7)
            };
            //api.setState("rowData", _rowData);
            api.setState("rowData",_rowData);
            api.setState("totalRecords", rowData.rows.length);
        }
        api.setState("pageIdx", 0); // Resetting page index on every search
    }
}
