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
    var allData = api.data.get_app_upgrade_list_1.output;
    var upgradableApps = allData.regularApps || {};
    var goldenConfigApps = allData.goldenConfigApps || {};    
    api.setState("successNewInstalls", allData.successNewInstalls);
    api.setState("successUpgrades", allData.successUpgrades);

    var lastRefreshTime = new Date().toISOString();
    api.setState("lastRefreshed", lastRefreshTime);
    api.setState("now", lastRefreshTime);

    helpers.timing.setInterval(function() {
        api.setState("now", new Date().toISOString());
    }, 60000);

    // Table data for regular apps
    var tableData = {
        "customCellEmittedActions": ["NOW_DROPDOWN#ITEM_CLICKED", "NOW_TEXT_LINK#CLICKED"],
        "rows": []
    };

    // Table data for golden config apps
    var goldenConfigTableData = {
        "customCellEmittedActions": ["NOW_DROPDOWN#ITEM_CLICKED", "NOW_TEXT_LINK#CLICKED"],
        "rows": []
    };

    var postUpgradeStatuses = {};
    var failedAppsCount = 0;
    var gcFailedAppsCount = 0;

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

    function getPostUpgradeStatus(app, showTracker, isFailed, isAppUpToDate) {
        var installStatus = "";
        var installHref = "/now/app-manager/home/app/id/" + app.app_sys_id;

        if (showTracker) {
            installStatus = app.state ? (app.state === "Successful" ? "Updated" : app.state) : (isFailed ? "Failed" : "");
            return {installStatus, installHref};
        }

        if (app.schedule && app.schedule.schedule_id) {
            installStatus = "Scheduled (" + app.schedule.version + ")";
            return {installStatus, installHref};
        } 

        if (app.plan_item_version && app.plan_item_version === app.installed_version && isAppUpToDate) {
            return {installStatus: "Up to date", installHref};
        }

        const lowerStatus = app.status_message ? app.status_message.toLowerCase() : '';
        if (lowerStatus === 'not selected') {
            if ((app.installed_version && app.installed_version.toLowerCase() === 'not installed') && 
                app.upgradable_versions && app.upgradable_versions.length > 0) {
                return {installStatus: "Update available", installHref};
            }
            return {installStatus: isAppUpToDate ? "Updated" : "Update available", installHref};
        }

        const lowerDisp = app.disposition ? app.disposition.toLowerCase() : '';
        if (lowerDisp === "installed" || lowerDisp === "updated") {
            if (app.plan_item_version === app.installed_version) {
                return {installStatus: isAppUpToDate ? "Updated" : "Update available", installHref};
            }
            return {installStatus: "Updated", installHref};
        }

        return {installStatus: isAppUpToDate ? "Updated" : "Update available", installHref};
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

    var previewSelectedApps = 0;
    var statCountMap = { appsToBeUpdated: 0, installedApps: 0, scheduledApps: 0, totalApps: 0 };
    
    var gcPreviewSelectedApps = 0;
    var gcStatCountMap = { appsToBeUpdated: 0, installedApps: 0, scheduledApps: 0, totalApps: 0 };
    Object.keys(upgradableApps).forEach(function(key, index) {
        var app = upgradableApps[key];
        var scope = app.scope;

        var versionItems = (app.upgradable_versions || []).map(function(v) {
            return {
                "id": v,
                "label": v,
                "scope": scope
            };
        });

        var state = app.state ? app.state.toLowerCase() : "";
        var isFailed = state.includes("fail") || state.includes("cancel");
        var isRunningOrPending = state.includes("running") || state.includes("pending");
        var hasTracker = !!(app.tracker && app.tracker.trackerId);
        var showTracker = hasTracker; 
        var isAppUpToDate = app.installed_version === (app.upgradable_versions && app.upgradable_versions[0]);
        var isSelectionDisabled = shouldDisableSelection(app);

        if (app.status_message && app.status_message.toLowerCase().indexOf("not selected") !== -1) {
            previewSelectedApps++;
        }
        if (app.upgradable_versions && app.upgradable_versions.indexOf(app.installed_version) === -1) {
            statCountMap.appsToBeUpdated++;
        }

        var {installStatus, installHref} = getPostUpgradeStatus(app, showTracker, isFailed, isAppUpToDate);
        var statusLabel = getStatusLabel(app.disposition, app.status_message);
        var selectedVersion = (app.schedule && app.schedule.version) || (app.upgradable_versions && app.upgradable_versions[0]) || '';

        if (hasTracker && isRunningOrPending) {
            selectedVersion = app.tracker.version;
        }

        if (installStatus === "Updated"){ 
            statCountMap.installedApps++; 
        } else if (installStatus.indexOf("Scheduled (") === 0) {
            statCountMap.scheduledApps++; 
        }

        var isBlockedByErrorIndicators = app.indicators[selectedVersion];
        postUpgradeStatuses[scope] = installStatus;
        
        if (statusLabel && (statusLabel.toLowerCase().includes("failed") || statusLabel.toLowerCase().includes("error"))) {
            failedAppsCount++;
        }

        var row = {
            "type": "default",
            "selectionDisabled": isSelectionDisabled || isBlockedByErrorIndicators,
            "selectionDisabled": isSelectionDisabled || isBlockedByErrorIndicators,
            "isSelected": false,
            "key": scope,
            "_indicatorsObj": app.indicators,
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
                "status": {
                    "value": app.status_message,
                    "label": app.status_message,
                    "componentProps": {
                        "label": statusLabel,
                        "color": getStatusColor(app.disposition, app.status_message)
                    }
                },
                "current_version": {
                    "value": app.installed_version
                },
                "latest_version": {
                    "value": app.latest_available_version
                },
                "upgrade_version": {
                    "value": app.upgradable_versions && app.upgradable_versions[0],
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
                "app_sys_id": {
                    "value": app.app_sys_id
                },
                "is_store_app": {
                    "value": app.is_store_app
                },
                "scope": {
                    "value": scope
                },
                "state": {
                    "value": installStatus,
                    "lable": installStatus,
                    "componentProps": {
                        "label": installStatus,
                        "href": "javascript:void(0)",
                        "installHref": installHref,
                        "trackerId": app.tracker && app.tracker.trackerId,
                        "showTracker": showTracker
                    }
                },
                "plan_item_version": {
                    "value": (statusLabel && 
                             (statusLabel.toLowerCase() === "not selected" || 
                              statusLabel.toLowerCase() === "not available")) ? 
                             '' : 
                             app.plan_item_version,
                },
                "index": {
                    "value": index
                },
                "disposition": {
                    "value": app.disposition
                },
                "schedule": app.schedule
            }
        };

        tableData.rows.push(row);
    });
  Object.keys(goldenConfigApps).forEach(function(key, index) {
    var app = goldenConfigApps[key];
    var scope = app.scope;

    var versionItems = (app.upgradable_versions || []).map(function(v) {
        return {
            "id": v,
            "label": v,
            "scope": scope,
            "suite_version": app.suite_version
        };
    });

    var state = app.state ? app.state.toLowerCase() : "";
    var isFailed = state.includes("fail") || state.includes("cancel");
    var isRunningOrPending = state.includes("running") || state.includes("pending");
    var hasTracker = !!(app.tracker && app.tracker.trackerId);
    var showTracker = hasTracker; 
    var isAppUpToDate = app.installed_version === (app.upgradable_versions && app.upgradable_versions[0]);
    var isSelectionDisabled = shouldDisableSelection(app);

    var {installStatus, installHref} = getPostUpgradeStatus(app, showTracker, isFailed, isAppUpToDate);
    var selectedVersion = (app.schedule && app.schedule.version) || (app.upgradable_versions && app.upgradable_versions[0]) || '';

    if (hasTracker && isRunningOrPending) {
        selectedVersion = app.tracker.version;
    }

    // NEW: Calculate disposition and status_message based on version comparison
    // BUT preserve original values if they already exist (e.g., from backend)
    var currentVersion = app.installed_version;
    var statusMessage = app.status_message || "";
    var disposition = app.disposition || "";
    
    // Only recalculate if not already set
    if (!statusMessage) {
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
    }
    
    // Use the getStatusLabel function for consistency
    var statusLabel = getStatusLabel(disposition, statusMessage);

    var isBlockedByErrorIndicators = app.indicators && app.indicators[selectedVersion];
    
    if (statusLabel && (statusLabel.toLowerCase().includes("failed") || statusLabel.toLowerCase().includes("error"))) {
        gcFailedAppsCount++;
    }
    
    // Update stat counts based on status
    if (statusLabel === "Success") {
        gcStatCountMap.installedApps++;
    } else if (statusMessage === "Will be updated" || statusMessage === "Will be installed") {
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
            "status": {
                "value": statusMessage,  // Use calculated status
                "label": statusMessage,
                "componentProps": {
                    "label": statusLabel,
                    "color": getStatusColor(disposition, statusMessage)
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
            "app_sys_id": {
                "value": app.app_sys_id
            },
            "is_store_app": {
                "value": app.is_store_app
            },
            "scope": {
                "value": scope
            },
            "suite_version": {
                "value": app.suite_version || ""
            },
            "sys_code": {
                "value": app.app_sys_id
            },
            "state": {
                "value": installStatus,
                "lable": installStatus,
                "componentProps": {
                    "label": installStatus,
                    "href": "javascript:void(0)",
                    "installHref": installHref,
                    "trackerId": app.tracker && app.tracker.trackerId,
                    "showTracker": showTracker
                }
            },
            "plan_item_version": {
                "value": (statusLabel && 
                         (statusLabel.toLowerCase() === "not selected" || 
                          statusLabel.toLowerCase() === "not available")) ? 
                         '' : 
                         app.plan_item_version,
            },
            "index": {
                "value": index
            },
            "disposition": {
                "value": disposition  // Use calculated disposition
            },
            "schedule": app.schedule
        }
    };

    goldenConfigTableData.rows.push(gcRow);
});
    function getDispRank(row, statuses) {
        var postInstallStatus = statuses[row.cells.scope && row.cells.scope.value];
        
        if (postInstallStatus) {
            var postInstallStatusLower = postInstallStatus.toLowerCase();
            if (postInstallStatusLower.includes('failed') || 
                postInstallStatusLower.includes('error') || 
                postInstallStatusLower.includes('cancel')) {
                return 0;
            }
            if (postInstallStatusLower.includes('running') || 
                postInstallStatusLower.includes('pending')) {
                return 2;
            }
            if (postInstallStatusLower.includes('scheduled')) {
                return 3;
            }
            if (postInstallStatusLower.includes('update available')) {
                return 4;
            }
            if (postInstallStatusLower.includes('updated')) {
                return 5;
            }
            if (postInstallStatusLower.includes('up to date')) {
                return 6;
            }
        }

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
        
        if (!disp) return 4;
        if (disp === "failed") return 0;
        if (status.includes("failed") || status.includes("error")) return 2;
        if (disp === "installed" || disp === "updated") return 1;
        if (status.includes("not selected")) return 2;
        return 3;
    }
    tableData.rows.sort(function(a, b) {
        return getDispRank(a, postUpgradeStatuses) - getDispRank(b, postUpgradeStatuses);
    });

    goldenConfigTableData.rows.sort(function(a, b) {
        return getDispRank(a, postUpgradeStatuses) - getDispRank(b, postUpgradeStatuses);
    });

    statCountMap.totalApps = tableData.rows.length;
    statCountMap.appsToBeUpdated = statCountMap.appsToBeUpdated - statCountMap.scheduledApps;
    
    gcStatCountMap.totalApps = goldenConfigTableData.rows.length;
    gcStatCountMap.appsToBeUpdated = gcStatCountMap.appsToBeUpdated - gcStatCountMap.scheduledApps;

    // Set regular apps states
    api.setState("previewSelectedApps", previewSelectedApps);
    api.setState("rowData", tableData);
    api.setState("statCounts", statCountMap);
    api.setState("lastRefreshTime", lastRefreshTime);
    api.setState("origRowData", tableData);
    api.setState('failedAppsCount', failedAppsCount);
    
    // Set golden config apps states
    api.setState("gcPreviewSelectedApps", gcPreviewSelectedApps);
    api.setState("gcRowData", goldenConfigTableData);
    api.setState("gcStatCounts", gcStatCountMap);
    api.setState("gcOrigRowData", goldenConfigTableData);
    api.setState('gcFailedAppsCount', gcFailedAppsCount);
    api.setState("gcTableCount", goldenConfigTableData.rows.length);

    var allAppsObject = {};
    Object.keys(upgradableApps).forEach(function(key) {
        allAppsObject[key] = upgradableApps[key];
    });
    Object.keys(goldenConfigApps).forEach(function(key) {
        allAppsObject[key] = goldenConfigApps[key];
    });
    api.setState("allApps", allAppsObject);
    
    // Store suite config maps and suite versions from data source
    if (allData.suiteConfigMaps) {
        api.setState("suiteConfigMaps", allData.suiteConfigMaps);
    }
    if (allData.suiteVersions) {
        api.setState("suiteVersions", allData.suiteVersions);
    }
    if (allData.selectedSuite) {
        api.setState("selectedSuiteVersion", allData.selectedSuite.version);
    }
    if (allData.latestSuite) {
        api.setState("latestSuite", allData.latestSuite);
    }
    if (allData.installedSuite) {
        api.setState("installedSuiteVersion", allData.installedSuite.version);
    }
    
    // Reset all states
    api.setState("searchText", null);
    api.setState("displayedSearchText", "");
    api.setState("performingAction", false);
    api.setState("isUpgradeTableLoading", false);
    api.setState("isgcstoreappsLoading", false);
    api.setState("shouldDisableUpdateBtn", true);
    api.setState("shouldDisableScheduleBtn", true);
    api.setState("shouldDisableDeleteScheduled", true);
}
