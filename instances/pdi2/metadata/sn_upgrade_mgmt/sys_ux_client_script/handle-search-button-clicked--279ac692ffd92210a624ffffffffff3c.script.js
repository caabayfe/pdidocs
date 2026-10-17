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
  api.setState("page", 0);
  var searchText = api.state.searchText;
  var origData = api.state.origRowData;

  api.setState("displayedSearchText", searchText);

  if (!searchText) {
    api.setState("rowData", origData);
    return;
  }

  var lowerSearchWords = searchText.toLowerCase().split(/\s+/);
  var filteredRows = [];

  for (var i = 0; i < origData.rows.length; i++) {
    var row = origData.rows[i];
    var name = row.cells && row.cells.app_name && row.cells.app_name.label ? row.cells.app_name.label.toLowerCase() : '';
    var state = row.cells && row.cells.state && row.cells.state.value ? row.cells.state.value.toLowerCase() : '';
    var combined = name + ' ' + state;

    var match = true;
    for (var j = 0; j < lowerSearchWords.length; j++) {
      if (combined.indexOf(lowerSearchWords[j]) === -1) {
        match = false;
        break;
      }
    }

    if (match) {
      filteredRows.push(row);
    }
  }

  api.setState("rowData", {
    customCellEmittedActions: origData.customCellEmittedActions,
    rows: filteredRows
  });
}
