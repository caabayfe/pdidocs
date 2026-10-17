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
    let updatesCount = 0, needCompatibilityCheck = false, selectedCount = 0;
    const updatedRowData = origRowData.rows.map(row => {
        if (row.isSelected === false) {
            const selectedVersion = row.cells.upgrade_version.componentProps.selectedItems[0];
            const currentVersion = row.cells.current_version.value;

            needCompatibilityCheck = needCompatibilityCheck || row.cells.state.value === "Check compatibility";

            // if app is not selected and but updating
            if (currentVersion !== selectedVersion && row.cells.current_version.value !== 'Not Installed') updatesCount++;
            return row;
        }
        // if app is selected, we are anyway updating
        if (row.cells.current_version.value !== 'Not Installed') {
            updatesCount++;
        }

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

        rowSelectionsforAPI[row.key] = row;
        row.isSelected = false;
        selectedCount++;
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
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Set selected apps to latest versions',
        value: {
            'Session id': api.context.props.experienceProperties.upgrade_session_id.value,
            'Count': selectedCount
        }
    });
}
