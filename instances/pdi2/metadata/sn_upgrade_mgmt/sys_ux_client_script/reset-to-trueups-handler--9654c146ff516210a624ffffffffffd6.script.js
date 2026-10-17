/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const origRowData = JSON.parse(JSON.stringify(api.state.origRowData));

    const rowSelectionsforAPI = {};
    let updatesCount = 0, needCompatibilityCheck = false;
    const updatedRowData = origRowData.rows.map(row => {
        const trueupVersion = row.cells.true_up_version;
        const currentVersion = row.cells.current_version;
        const nextVersion = trueupVersion.value || currentVersion.value;
        const alreadyCheckedVersion = row.cells.checked_version;

        row.cells.upgrade_version.componentProps.selectedItems = [nextVersion];
        if (nextVersion === alreadyCheckedVersion.value) {
            row.cells.state.componentProps = {
                "label": alreadyCheckedVersion.state.componentProps.label,
                "color": alreadyCheckedVersion.state.componentProps.color
            };
            row.cells.state.value = alreadyCheckedVersion.state.value;
            row.cells.status_message.value = alreadyCheckedVersion.status_message.value;
            updatesCount += row.cells.current_version.value !== 'Not Installed' && alreadyCheckedVersion.state.value !== 'Not selected' ? 1 : 0;
        } else if (trueupVersion.value !== null) {
            row.cells.state.componentProps = {
                "label": "Check compatibility",
                "color": "warning"
            };
            row.cells.state.value = "Check compatibility";
            row.cells.status_message.value = "";
            updatesCount++;
        } else {
            row.cells.state.componentProps = {
                "label": "Not selected",
                "color": "low"
            };
            row.cells.state.value = "Not selected";
            row.cells.status_message.value = "";
        }

        needCompatibilityCheck = needCompatibilityCheck || row.cells.state.value === "Check compatibility";

        row.isSelected = false;
        rowSelectionsforAPI[row.key] = row;
        return row;
    });

    api.setState("tableIsDirty", needCompatibilityCheck);
    api.setState("updatesCount", updatesCount);

    api.setState("rowData", {
        customCellEmittedActions: api.state.rowData.customCellEmittedActions,
        rows: updatedRowData
    });

    api.setState("origRowData", {
        customCellEmittedActions: api.state.origRowData.customCellEmittedActions,
        rows: updatedRowData
    });

    api.setState("rowSelectionsforAPI", rowSelectionsforAPI);
}
