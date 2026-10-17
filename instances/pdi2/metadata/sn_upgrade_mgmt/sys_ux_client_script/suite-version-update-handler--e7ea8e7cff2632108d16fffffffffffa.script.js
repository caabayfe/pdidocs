/**
 * Suite Version Dropdown Change Handler - Post Upgrade
 * 
 * Re-classifies golden config apps based on the selected suite version.
 * When suite version changes, the selected app version updates to match the suite's recommendation.
 * Regular apps remain unchanged when the suite version dropdown is modified.
 * This handler performs client-side re-classification without making server calls.
 * 
 * @param {params} params
 * @param {api} params.api - UI Builder API for state management
 * @param {any} params.event - Event payload containing selected suite version
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    // Validate event payload
    if (!event.payload || !event.payload.item || !event.payload.item.id) {
        console.log('Invalid event payload for suite version dropdown');
        return;
    }
    
    var selectedSuiteVersion = event.payload.item.id;
    console.log('Post-upgrade suite version dropdown changed to:', selectedSuiteVersion);
    
    // Update selected suite version in state
    api.setState("selectedSuiteVersion", selectedSuiteVersion);
    
    // Get suite config maps and all apps from state
    var suiteConfigMaps = api.state.suiteConfigMaps || {};
    var selectedSuiteConfigMap = suiteConfigMaps[selectedSuiteVersion] || {};
    var allApps = api.state.allApps || {};
    
    function getStatusColor(disp, status) {
        const lowerDisp = disp ? disp.toLowerCase() : "";
        
        if (lowerDisp.includes("failed") || lowerDisp.includes("error")) {
            return "critical";
        }
        if (lowerDisp === "installed" || lowerDisp === "updated") {
            return "green";
        }
        if (!status || status === '') {
            return "low";
        }
        if (status && status.toLowerCase().includes("not selected")) {
            return "warning";
        }
        return "low";
    }

    function getStatusLabel(disp, status) {
        const lowerDisp = disp ? disp.toLowerCase() : "";
        return (lowerDisp === "installed" || lowerDisp === "updated") ? "Success" : (status || "Not available");
    }

    function shouldDisableSelection(app) {
        if (app.schedule && app.schedule.schedule_id) {
            return false;
        }

        var lowerState = app.state ? app.state.toLowerCase() : "";
        if (lowerState.includes("running") || lowerState.includes("pending")) {
            return true;
        }

        if (!app.upgradable_versions || !app.upgradable_versions.length) {
            return true;
        }

        if (app.upgradable_versions.length === 1 && 
            app.upgradable_versions[0].toLowerCase() === "not available") {
            return true;
        }
        
        return app.installed_version === app.upgradable_versions[0];
    }

    function getDispRank(row) {
        var disp = (row.cells && 
                   row.cells.disposition && 
                   typeof row.cells.disposition.value === "string") ? 
                   row.cells.disposition.value.toLowerCase() : 
                   "";
        var status = (row.cells && 
                     row.cells.status && 
                     row.cells.status.value &&
                     typeof row.cells.status.value === "string") ? 
                     row.cells.status.value.toLowerCase() : 
                     "";
        
        if (!disp && !status) return 4;
        if (disp === "failed" || status.includes("failed") || status.includes("error")) return 0;
        if (disp === "installed" || disp === "updated") return 1;
        if (status.includes("not selected")) return 2;
        return 3;
    }
    
    var goldenConfigApps = {};
    var gcStatCountMap = { appsToBeUpdated: 0, installedApps: 0, scheduledApps: 0, totalApps: 0 };
    var gcFailedAppsCount = 0;
    for (var scope in allApps) {
        var app = allApps[scope];
        var isInSuite = false;
        var suiteAppVersion = null;
        
        // Check if app exists in selected suite config
        for (var suiteName in selectedSuiteConfigMap) {
            if (selectedSuiteConfigMap[suiteName][selectedSuiteVersion] && 
                selectedSuiteConfigMap[suiteName][selectedSuiteVersion][scope]) {
                isInSuite = true;
                suiteAppVersion = selectedSuiteConfigMap[suiteName][selectedSuiteVersion][scope];
                break;
            }
        }
        
        if (isInSuite) {
            var appCopy = Object.assign({}, app);
            appCopy.suite_version = selectedSuiteVersion;
            appCopy.suite_recommended_version = suiteAppVersion;
            
            goldenConfigApps[scope] = appCopy;
        }
    }
    
    // Build table data for golden config apps
    var goldenConfigTableData = {
        "customCellEmittedActions": ["NOW_DROPDOWN#ITEM_CLICKED", "NOW_TEXT_LINK#CLICKED"],
        "rows": []
    };
    
 Object.keys(goldenConfigApps).forEach(function(scope, index) {
    var app = goldenConfigApps[scope];

    var versionItems = (app.upgradable_versions || []).map(function(v) {
        return {
            "id": v,
            "label": v,
            "scope": scope,
            "suite_version": app.suite_version
        };
    });

    var isSelectionDisabled = shouldDisableSelection(app);
    var selectedVersion = '';
    var suiteRecommendedVersion = null;
    
    for (var suiteName in selectedSuiteConfigMap) {
        if (selectedSuiteConfigMap[suiteName][selectedSuiteVersion] && 
            selectedSuiteConfigMap[suiteName][selectedSuiteVersion][scope]) {
            suiteRecommendedVersion = selectedSuiteConfigMap[suiteName][selectedSuiteVersion][scope];
            break;
        }
    }
    
    if (suiteRecommendedVersion) {
        selectedVersion = suiteRecommendedVersion;
    } else if (app.schedule && app.schedule.version) {
        selectedVersion = app.schedule.version;
    } else if (app.plan_item_version) {
        selectedVersion = app.plan_item_version;
    } else {
        selectedVersion = (app.upgradable_versions && app.upgradable_versions[0]) || '';
    }

    // Calculate disposition and status_message based on version comparison
    var currentVersion = app.installed_version;
    var statusMessage = "";
    var disposition = "";
    
    if (currentVersion === selectedVersion) {
        // Versions match - already installed
        statusMessage = "Installed";
        disposition = "installed";
    } else if (currentVersion === "Not Installed" || currentVersion === "Not installed") {
        // App not installed yet
        statusMessage = "Will be installed";
        disposition = "";
    } else {
        // Versions don't match - needs update
        statusMessage = "Will be updated";
        disposition = "";
    }
    
    // Use the same getStatusLabel function as the populate table script
    var statusLabel = getStatusLabel(disposition, statusMessage);

    var isBlockedByErrorIndicators = app.indicators && app.indicators[selectedVersion];
    
    if (statusLabel && (statusLabel.toLowerCase().includes("failed") || statusLabel.toLowerCase().includes("error"))) {
        gcFailedAppsCount++;
    }
    
    // Update stat counts based on calculated status
    if (statusLabel === "Success") {
        gcStatCountMap.installedApps++;
    } else {
        gcStatCountMap.appsToBeUpdated++;
    }

    var gcRow = {
        "type": "default",
        "selectionDisabled": isSelectionDisabled || isBlockedByErrorIndicators,
        "isSelected": false,
        "key": scope,
        "_indicatorsObj": app.indicators,
        "cells": {
            "app_name": {
                "value": app.app_name,
                "label": app.app_name,
                "componentProps": {
                    "href": app.app_sys_id ? 
                        "/now/app-manager/home/app/id/" + app.app_sys_id : 
                        "/now/app-manager/home/tab/updates/sort/recently_released",
                    "label": app.app_name && app.app_name.indexOf("@") === 0 ? 
                        " " + app.app_name : 
                        (app.app_name || "")
                }
            },
            "current_version": {
                "value": app.installed_version
            },
            "latest_version": {
                "value": app.latest_available_version || ""
            },
            "selected_version": {
                "value": selectedVersion,
                "componentProps": {
                    "icon": "",
                    "items": versionItems,
                    "placeholder": "Select Version",
                    "select": "single",
                    "selectedItems": [selectedVersion].filter(Boolean),
                    "variant": "secondary",
                    "disabled": isSelectionDisabled
                }
            },
            "status": {
                "value": statusMessage,
                "label": statusMessage,
                "componentProps": {
                    "label": statusLabel,
                    "color": getStatusColor(disposition, statusMessage)
                }
            },
            "scope": {
                "value": scope
            },
            "disposition": {
                "value": disposition
            },
            "schedule": app.schedule,
            "app_sys_id": {
                "value": app.app_sys_id
            },
            "suite_version": {
                "value": app.suite_version || ""
            },
            "sys_code": {
                "value": app.app_sys_id
            }
        }
    };

    goldenConfigTableData.rows.push(gcRow);
});
    // Sort the golden config table
    goldenConfigTableData.rows.sort(function(a, b) {
        return getDispRank(a) - getDispRank(b);
    });
    gcStatCountMap.totalApps = goldenConfigTableData.rows.length;
    gcStatCountMap.appsToBeUpdated = goldenConfigTableData.rows.filter(function(row) {
        var currentVer = row.cells.current_version.value;
        var latestVer = row.cells.latest_version.value;
        return currentVer && latestVer && currentVer !== latestVer;
    }).length;
    gcStatCountMap.installedApps = goldenConfigTableData.rows.filter(function(row) {
        var currentVer = row.cells.current_version.value;
        var latestVer = row.cells.latest_version.value;
        return currentVer && latestVer && currentVer === latestVer;
    }).length;
    
    gcStatCountMap.scheduledApps = goldenConfigTableData.rows.filter(function(row) {
        return row.cells.schedule && row.cells.schedule.schedule_id;
    }).length;
    
    // Update golden config UI states
    api.setState("gcRowData", goldenConfigTableData);
    api.setState("gcOrigRowData", goldenConfigTableData);
    api.setState("gcTableCount", goldenConfigTableData.rows.length);
    api.setState("gcStatCounts", gcStatCountMap);
    api.setState("gcFailedAppsCount", gcFailedAppsCount);
    api.data.update_selected_suite_version_1.refresh();
}
