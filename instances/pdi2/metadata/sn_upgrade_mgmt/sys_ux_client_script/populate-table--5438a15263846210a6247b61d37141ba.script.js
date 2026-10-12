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
    var dataSource;
    if (api.state.isPostLane) {
        var preserved = api.data.get_preserved_app_list.output;
        if (preserved && preserved.regularApps && Object.keys(preserved.regularApps).length > 0) {
            dataSource = preserved;
        } else {
            var previewOutput = api.data.get_app_preview_list_1.output;
            if (previewOutput && previewOutput.regularApps) {
                dataSource = previewOutput;
            } else {
                // Data broker is EXPLICIT — trigger fetch and return.
                // DATA_FETCH_SUCCEEDED will re-invoke this handler with data.
                api.data.get_app_preview_list_1.refresh();
                return;
            }
        }
    } else {
        dataSource = api.data.get_app_preview_list_1.output;
    }
    var upgradableApps = dataSource.regularApps;
    var goldenConfigApps = dataSource.goldenConfigApps;

    // Table data for regular apps
    var tableData = {
        "customCellEmittedActions": ["NOW_DROPDOWN#ITEM_CLICKED"],
        "rows": []
    };
    
    // Table data for golden config apps
    var goldenConfigTableData = {
        "customCellEmittedActions": ["NOW_DROPDOWN#ITEM_CLICKED"],
        "rows": []
    };
    
    var updateCount = 0;
    var newCount = 0;
    var errorCount = 0;
    
    var gcUpdateCount = 0;  // Golden config counts
    var gcNewCount = 0;
    var gcErrorCount = 0;

    api.setState("tableIsDirty", false);

    function getColor(status) {
        if(status === "error")
            return "critical";
        if(status === "ready")
            return "green";
        return "low";
    }

    Object.keys(upgradableApps).forEach(function(key, index) {
        const app = upgradableApps[key];
        if (app.installed_version == "Not Installed")
            newCount++;
        else if(app.selected != null && app.selected != app.installed_version)
            updateCount++;
        var versionItems = app.upgradable_versions.map(function(version) {
            return {
                id: version,
                label: version,
                scope: app.scope,
                name: app.app_name,
                rowKey: index + "",
                current_version: app.installed_version,
                true_up_version: app.true_up_version,
                sys_code: app.sys_code
            };
        });

        var latestVersion = app.upgradable_versions[0]; // Select the latest available version

        if(app.state === "error"){
            errorCount++;
        }
        function getStateProps(str) {
            if (!str){
                if(app.installed_version == app.selected)
                    return {
                        label: "Not selected",
                        color: "low"
                     };
                else
                    api.setState("tableIsDirty", true);
                    return {
                        label: "Check compatibility",
                    };
            }
            
            // Map state values to display names
            var stateMap = {
                "will_be_installed": { label: "Will be installed", color: "green" },
                "will_be_updated": { label: "Will be updated", color: "green" },
                "up_to_date": { label: "Up to date", color: "low" },
                "ready_to_download": { label: "Ready To Download", color: "low" },
                "downloading": { label: "Downloading", color: "low" },
                "ready": { label: "Compatible", color: "green" },
                "already_installed": { label: "Already Installed", color: "low" },
                "latest_version_installed": { label: "Latest Version Installed", color: "low" },
                "error": { label: "Error", color: "critical" }
            };
            
            var lowerStr = str.toLowerCase();
            if (stateMap[lowerStr]) {
                return stateMap[lowerStr];
            }
            
            // Fallback: capitalize first letter for unknown states
            return {label: str.charAt(0).toUpperCase() + str.slice(1), color: getColor(str)};
        }

        var row = {
            "cells": {
                "app_name": {
                    "value": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/"+app.sys_code,
                    "label": app.app_name
                },
                "current_version": {
                    "value": app.installed_version
                },
                "latest_version": {
                    "value": app.latest_available_version
                },
                "upgrade_version": {
                    "componentProps": {
                        "icon": "",
                        "items": versionItems,
                        "placeholder": "Select Version",
                        "select": "single",
                        "selectedItems": [app.selected], // Pre-select latest version - change to select as per upgrade plan
                        "variant": "secondary"
                    },
                    "value": latestVersion
                },
                "scope": {
                    "value": app.scope
                },
                "true_up_version": {
                    "value": app.true_up_version
                },
                "sys_code": {
                    "value": app.sys_code
                },
                "checked_version": {
                    "value": app.already_checked_version !== null ? app.already_checked_version : app.selected,
                    "state": {
                        "componentProps": app.already_checked_version !== null ? getStateProps('ready') : getStateProps(app.state),
                        "value": app.already_checked_version !== null ? getStateProps('ready').label : getStateProps(app.state).label
                    },
                    "status_message": {
                        "value": app.status_message
                    }
                },
                "state": {
                    "componentProps": getStateProps(app.state),
                    "value": getStateProps(app.state).label,
                    "label": getStateProps(app.state).label
                },
                "status_message": {
                    "value": app.status_message
                }
            },
            "key": index.toString(),
            "type": "default",
            isSelected: false
        };

        tableData.rows.push(row);
    });
    
    // Populate golden config apps table
    Object.keys(goldenConfigApps).forEach(function(key, index) {
        const app = goldenConfigApps[key];
        if (app.installed_version == "Not Installed")
            gcNewCount++;
        else if(app.selected != null && app.selected != app.installed_version)
            gcUpdateCount++;
        var versionItems = app.upgradable_versions.map(function(version) {
            return {
                id: version,
                label: version,
                scope: app.scope,
                name: app.app_name,
                rowKey: index + "",
                current_version: app.installed_version,
                true_up_version: app.true_up_version,
                sys_code: app.sys_code,
                suite_version: app.suite_version  // Golden config specific
            };
        });

        var latestVersion = app.upgradable_versions[0];

        if(app.state === "error"){
            gcErrorCount++;
        }
        
        function getStateProps(str) {
            if (!str){
                if(app.installed_version == app.selected)
                    return {
                        label: "Not selected",
                        color: "low"
                     };
                else
                    api.setState("tableIsDirty", true);
                    return {
                        label: "Check compatibility",
                    };
            }
            
            var stateMap = {
                "will_be_installed": { label: "Will be installed", color: "green" },
                "will_be_updated": { label: "Will be updated", color: "green" },
                "up_to_date": { label: "Up to date", color: "low" },
                "ready_to_download": { label: "Ready To Download", color: "low" },
                "downloading": { label: "Downloading", color: "low" },
                "ready": { label: "Compatible", color: "green" },
                "already_installed": { label: "Already Installed", color: "low" },
                "latest_version_installed": { label: "Latest Version Installed", color: "low" },
                "error": { label: "Error", color: "critical" }
            };
            
            var lowerStr = str.toLowerCase();
            if (stateMap[lowerStr]) {
                return stateMap[lowerStr];
            }
            
            return {label: str.charAt(0).toUpperCase() + str.slice(1), color: getColor(str)};
        }

        var gcRow = {
            "cells": {
                "app_name": {
                    "value": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/"+app.sys_code,
                    "label": app.app_name
                },
                "status": {
                    "componentProps": getStateProps(app.state),
                    "value": getStateProps(app.state).label,
                    "label": getStateProps(app.state).label
                },
                "current_suite": {
                    "value": app.installed_version
                },
                "latest_suite": {
                    "value": app.latest_available_version || ""
                },
                "selected_suite": {
                    "componentProps": {
                        "icon": "",
                        "items": versionItems,
                        "placeholder": "Select Version",
                        "select": "single",
                        "selectedItems": [app.selected_suite || app.selected],
                        "variant": "secondary"
                    },
                    "value": app.selected_suite || app.selected
                },
                "scope": {
                    "value": app.scope
                },
                "suite_version": {
                    "value": app.suite_version
                },
                "sys_code": {
                    "value": app.sys_code
                },
                "checked_version": {
                    "value": app.already_checked_version !== null ? app.already_checked_version : app.selected,
                    "status": {
                        "componentProps": app.already_checked_version !== null ? getStateProps('ready') : getStateProps(app.state),
                        "value": app.already_checked_version !== null ? getStateProps('ready').label : getStateProps(app.state).label
                    },
                    "status_message": {
                        "value": app.status_message
                    }
                },

                "status_message": {
                    "value": app.status_message
                }
            },
            "key": index.toString(),
            "type": "default",
            isSelected: false
        };

        goldenConfigTableData.rows.push(gcRow);
    });
    
    // Sort golden config table
    goldenConfigTableData.rows.sort(function(rowA, rowB) {
        const hasSuiteVersionA = !!rowA.cells.suite_version?.value;
        const hasSuiteVersionB = !!rowB.cells.suite_version?.value;

        // Rows with suite_version should come first
        if (hasSuiteVersionA && !hasSuiteVersionB) return -1;
        if (!hasSuiteVersionA && hasSuiteVersionB) return 1;
        return 0;
    });
    
    // Sort regular apps table
    tableData.rows.sort(function(rowA, rowB) {
        const hasTrueUpA = !!rowA.cells.true_up_version?.value;
        const hasTrueUpB = !!rowB.cells.true_up_version?.value;

        // Rows with true_up_version should come first
        if (hasTrueUpA && !hasTrueUpB) return -1;
        if (!hasTrueUpA && hasTrueUpB) return 1;
        return 0;
    });
    tableData.rows.sort(function(a, b) {
        function getStateRank(row) {
            var state = "";

            if (
                row &&
                row.cells &&
                row.cells.state &&
                typeof row.cells.state.value === "string"
            ) {
                state = row.cells.state.value.toLowerCase();
            }

            if (state === "error") return 0;
            if (state === "not selected") return 2;
            if (state === "") return 3;
            return 1;
        }

        return getStateRank(a) - getStateRank(b);
    });
    let activityState = api.data.playbook_activity_ui.playbookCardProperties.activityState.value;
    if(activityState == null)
        activityState = "IN_PROGRESS";

    if(!api.state.isProcessing && activityState === "IN_PROGRESS" )
        api.setState("columnData", api.state.defaultColumnData);

    if(activityState !== "IN_PROGRESS")
        api.setState("columnData", api.state.disabledColumnData);

    

    // Set regular apps table states
    api.setState("rowData", tableData);
    api.setState("searchText", null);
    api.setState("displayedSearchText", "");
    api.setState("origRowData", tableData);
    api.setState("storePreviewTableCount", tableData.rows.length);
    api.setState("updatesCount", updateCount + gcUpdateCount);
    api.setState("newCount", newCount + gcNewCount);
    api.setState("errorCount", errorCount + gcErrorCount);
    api.setState("isPreviewTableLoading", false);
    api.setState("isgcappsLoading",false);
    api.setState("performingAction", false);
    
    // Set golden config apps table states
    api.setState("gcRowData", goldenConfigTableData);
    api.setState("gcOrigRowData", goldenConfigTableData);
    api.setState("gcTableCount", goldenConfigTableData.rows.length);
    api.setState("gcUpdatesCount", gcUpdateCount);
    api.setState("gcNewCount", gcNewCount);
    api.setState("gcErrorCount", gcErrorCount);
    
    // Store data needed for suite version dropdown handler
    var allAppsObject = {};
    Object.keys(upgradableApps).forEach(function(key) {
        allAppsObject[key] = upgradableApps[key];
    });
    Object.keys(goldenConfigApps).forEach(function(key) {
        allAppsObject[key] = goldenConfigApps[key];
    });
    api.setState("allApps", allAppsObject);
    
    // Store suite config maps and suite versions from data source
    if (dataSource.suiteConfigMaps) {
        api.setState("suiteConfigMaps", dataSource.suiteConfigMaps);
    }
    if (dataSource.suiteVersions) {
        api.setState("suiteVersions", dataSource.suiteVersions);
    }
    if (dataSource.selectedSuite) {
        api.setState("selectedSuiteVersion", dataSource.selectedSuite.version);
    }
    if (dataSource.latestSuite) {
        api.setState("latestSuiteVersion", dataSource.latestSuite.version);
    }

    if(errorCount > 0){
        api.setState("showErrorProcessBanner", true);
    }else
        api.setState("showErrorProcessBanner", false);

    // Persist golden config apps to sys_upgrade_plan_item table
    // Refresh the data broker to update backend with selected suite versions
    api.data.test1_1.refresh();

}
