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
    var detailType = event.payload.detail.type;

    var payload = event.payload || {};
    var detail = payload.detail || {};
    var detailType = detail.type;

    if (detailType === "NOW_DROPDOWN#ITEM_CLICKED") {
        var selectedItem = detail.payload && detail.payload.item;
        if (!selectedItem) return;

        var scope = selectedItem.scope;
        var upgradeVersion = selectedItem.id;
        var data = JSON.parse(JSON.stringify(api.state.rowData));
        var selectedRows = api.state.selectedRows;
        var rows = data.rows;

        for (var i = 0, len = rows.length; i < len; i++) {
            var row = rows[i];
            var cells = row.cells;

            if (cells.scope.value === scope) {
                var selectedVersion = [upgradeVersion];

                cells.upgrade_version.value = upgradeVersion;
                cells.upgrade_version.componentProps.selectedItems = selectedVersion;

                if (selectedRows[scope]) {
                    var selectedCell = selectedRows[scope].cells.upgrade_version;
                    selectedCell.value = upgradeVersion;
                    selectedCell.componentProps.selectedItems = selectedVersion;

                    api.setState('selectedRows', selectedRows);
                }
                row.selectionDisabled = row._indicatorsObj[selectedVersion]
                api.setState('rowData', data);
                break;
            }
        }

    }
}
