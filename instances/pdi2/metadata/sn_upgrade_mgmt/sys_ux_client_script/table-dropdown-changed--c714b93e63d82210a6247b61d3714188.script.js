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
    /*
        item.current_version - already installed version of the app (Current Version)
        item.id/item.label - current selected version of the app (Upgrade Version)
        item.rowKey - index of the application
    */
    const item = event.payload.detail.payload.item;

    const rows = api.state.origRowData.rows;
    let needCompatibilityCheck = false;

    // Optimistic update to local states 
    for (let i = 0; i < api.state.origRowData.rows.length; i++) {
        const row = api.state.origRowData.rows[i];

        const newSelectedVersion = item.id; // newly selected version of the application
        const oldSelectedVersion = row.cells.upgrade_version.componentProps.selectedItems[0];  // previously selected version of the application
        const currentInstalledVersion = row.cells.current_version.value; // current installed version
        const previouslyCheckedVersion = row.cells.checked_version.value;   // this is the version for which we have already checked the compatibility

        // skip if row triggered item index is not matching with record index
        // skip if current selected version is still selected
        if (row.key !== item.rowKey || oldSelectedVersion === newSelectedVersion) {
            needCompatibilityCheck = needCompatibilityCheck || row.cells.state.value === "Check compatibility";
            continue;
        }

        // if already installed version is now selected, reduce updatesCount
        // if already installed version is previously selected, increase updatesCount
        if (currentInstalledVersion === newSelectedVersion) {
            api.setState("updatesCount", api.state.updatesCount - 1);
        } else if (currentInstalledVersion === oldSelectedVersion) {
            api.setState("updatesCount", api.state.updatesCount + 1);
        }
        
        if(typeof row.cells.state.value === "string" && row.cells.state.value.toLowerCase() === "error") {
            var updatedErrorCount = api.state.errorCount - 1;
            api.setState("errorCount", updatedErrorCount);
        }

        if (newSelectedVersion == currentInstalledVersion) { // currently selected item is current version
            row.cells.state.componentProps = {
                "label": "Not selected",
                "color": "low"
            };
            row.cells.state.value = "Not selected";
            row.cells.status_message.value = "";

        } else if (newSelectedVersion === previouslyCheckedVersion) {
            const previousState = row.cells.checked_version.state;
            row.cells.state.componentProps = {
                "label": previousState.componentProps.label,
                "color": previousState.componentProps.color
            };
            row.cells.state.value = previousState.value;
            row.cells.status_message.value = "";    // We are only storing compatible versions in "checked_version". So status_message will always be empty
        } else { // currently selected version is a different version
            row.cells.state.componentProps = {
                "label": "Check compatibility",
                "color": "warning"
            };
            row.cells.state.value = "Check compatibility";
            row.cells.status_message.value = "";
        } 
        
        // Update selectedVersion with newly selectedVersion
        row.cells.upgrade_version.componentProps.selectedItems = [item.id];
        api.state.origRowData.rows[i] = row;

        // updating selected row to update plan
        const rowSelectionsforAPI = {};
        rowSelectionsforAPI[row.key] = row;
        api.setState("rowSelectionsforAPI", rowSelectionsforAPI);
        needCompatibilityCheck = needCompatibilityCheck || row.cells.state.value === "Check compatibility";
    }

    api.setState("tableIsDirty", needCompatibilityCheck);

    api.setState("rowData", {
        customCellEmittedActions: api.state.rowData.customCellEmittedActions,
        rows: {...api.state.origRowData.rows}
    });

    api.setState("origRowData", { ...api.state.origRowData });

    if (updatedErrorCount > 0) {
        api.setState("showErrorProcessBanner", true);
    } else {
        api.setState("showErrorProcessBanner", false);
    }
    
    // Refilter based on searchText
    var searchText = api.state.searchText;
    var origData = api.state.origRowData;

    if (!searchText) {
        helpers.timing.setTimeout(function() {
            api.setState("rowData", { ...api.state.origRowData });
        }, 100);

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

    // api.setState("rowData", {
    //     customCellEmittedActions: origData.customCellEmittedActions,
    //     rows: filteredRows
    // });

    helpers.timing.setTimeout(function() {
        api.setState("rowData", {
            customCellEmittedActions: origData.customCellEmittedActions,
            rows: filteredRows
        });
    }, 100);


}
