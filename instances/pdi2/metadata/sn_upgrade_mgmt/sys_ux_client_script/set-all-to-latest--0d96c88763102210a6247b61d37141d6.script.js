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
    const origRowData = JSON.parse(JSON.stringify(api.state.origRowData));

    const rowSelectionsforAPI = {};
    let needCompatibilityCheck = false;
    const updatedRowData = origRowData.rows.map(row => {
        const latestVersion = row.cells.latest_version;
        const alreadyCheckedVersion = row.cells.checked_version;

        row.cells.upgrade_version.componentProps.selectedItems = [latestVersion.value];

        if (latestVersion.value === alreadyCheckedVersion.value) {
            row.cells.state.componentProps = {
                "label": alreadyCheckedVersion.state.componentProps.label,
                "color": alreadyCheckedVersion.state.componentProps.color
            };
            row.cells.state.value = alreadyCheckedVersion.state.value;
            row.cells.status_message.value = alreadyCheckedVersion.status_message.value;
        } else {
            row.cells.state.componentProps = {
                "label": "Check compatibility",
                "color": "warning"
            };
            row.cells.state.value = "Check compatibility";
            row.cells.status_message.value = "";
        }

        needCompatibilityCheck = needCompatibilityCheck || row.cells.state.value === "Check compatibility";

        row.isSelected = false;
        rowSelectionsforAPI[row.key] = row;
        return row;
    });

    api.setState("tableIsDirty", needCompatibilityCheck);
    api.setState("updatesCount", origRowData.rows.length - api.state.newCount);

    api.setState("rowData", {
        customCellEmittedActions: api.state.rowData.customCellEmittedActions,
        rows: updatedRowData
    });

    api.setState("origRowData", {
        customCellEmittedActions: api.state.origRowData.customCellEmittedActions,
        rows: updatedRowData
    });
    
    api.setState("rowSelectionsforAPI", rowSelectionsforAPI);
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Set all apps to latest versions',
        value: {
            'Session id': api.context.props.experienceProperties.upgrade_session_id.value,
            'Count': api.state.storePreviewTableCount
        }
    });
}
