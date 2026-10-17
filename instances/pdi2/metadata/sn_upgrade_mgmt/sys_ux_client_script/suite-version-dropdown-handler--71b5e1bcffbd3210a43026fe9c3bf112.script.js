/**
 * Suite Version Dropdown Change Handler
 * 
 * Re-classifies golden config apps based on the selected suite version.
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
        return;
    }
    
    var selectedSuiteVersion = event.payload.item.id;
    
    // Update selected suite version in state
    api.setState("selectedSuiteVersion", selectedSuiteVersion);
    
    // Get suite config maps and all apps from state
    var suiteConfigMaps = api.state.suiteConfigMaps || {};
    var selectedSuiteConfigMap = suiteConfigMaps[selectedSuiteVersion] || {};
    var allApps = api.state.allApps || {};
    
    // Initialize classification containers and counters
    var goldenConfigApps = {};
    var gcUpdateCount = 0;
    var gcNewCount = 0;
    
    // Iterate through all apps and re-classify ONLY golden config apps based on selected suite version
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
            // Classify as golden config app
            var appCopy = Object.assign({}, app);
            appCopy.selected_suite = suiteAppVersion;
            appCopy.selected = suiteAppVersion; // Also set selected for consistency
            
            // Preserve original state if it exists (from compatibility check), otherwise determine state
            if (!app.state || app.state === "") {
                var installedVersion = app.installed_version;
                if (installedVersion === "Not Installed") {
                    appCopy.state = "will_be_installed";
                    gcNewCount++;
                } else if (installedVersion < suiteAppVersion) {
                    appCopy.state = "will_be_updated";
                    gcUpdateCount++;
                } else {
                    appCopy.state = "up_to_date";
                }
            } else {
                // Keep the original state from backend (compatibility check result)
                appCopy.state = app.state;
                // Count based on installed version
                if (app.installed_version === "Not Installed") {
                    gcNewCount++;
                } else if (app.installed_version !== app.latest_available_version) {
                    gcUpdateCount++;
                }
            }
            
            goldenConfigApps[scope] = appCopy;
        }
    }
    
    // Build table data for golden config apps - match the format from initial load
    var gcTableData = {
        rows: Object.keys(goldenConfigApps).map(function(scope, index) {
            var app = goldenConfigApps[scope];
            
            // Helper function to get state props
            function getStateProps(str) {
                if (!str) {
                    // Check if installed version equals selected version
                    if (app.installed_version == (app.selected_suite || app.selected)) {
                        return {
                            label: "Not selected",
                            color: "low"
                        };
                    }
                    return {
                        label: "Check compatibility",
                        color: "low"
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
                
                // Fallback for unknown states
                return {
                    label: str.charAt(0).toUpperCase() + str.slice(1), 
                    color: "low"
                };
            }
            
            // Build version items for dropdown
            var versionItems = (app.upgradable_versions || []).map(function(version) {
                return {
                    id: version,
                    label: version,
                    scope: app.scope,
                    name: app.app_name,
                    rowKey: index + "",
                    current_version: app.installed_version,
                    suite_version: app.suite_version,
                    sys_code: app.sys_code
                };
            });
            
            var stateProps = getStateProps(app.state);
            
            return {
                cells: {
                    app_name: {
                        value: "https://store.servicenow.com/sn_appstore_store.do#!/store/application/" + (app.sys_code || ''),
                        label: app.app_name || scope
                    },
                    status: {
                        componentProps: stateProps,
                        value: stateProps.label,
                        label: stateProps.label
                    },
                    current_suite: {
                        value: app.installed_version
                    },
                    latest_suite: {
                        value: app.latest_available_version || ""
                    },
                    selected_suite: {
                        componentProps: {
                            icon: "",
                            items: versionItems,
                            placeholder: "Select Version",
                            select: "single",
                            selectedItems: [app.selected_suite || app.selected],
                            variant: "secondary"
                        },
                        value: app.selected_suite || app.selected
                    },
                    scope: {
                        value: app.scope
                    },
                    suite_version: {
                        value: app.suite_version || selectedSuiteVersion
                    },
                    sys_code: {
                        value: app.sys_code
                    },
                    checked_version: {
                        value: app.already_checked_version !== null ? app.already_checked_version : app.selected_suite,
                        status: {
                            componentProps: app.already_checked_version !== null ? getStateProps('ready') : getStateProps(app.state),
                            value: app.already_checked_version !== null ? getStateProps('ready').label : getStateProps(app.state).label
                        },
                        status_message: {
                            value: app.status_message || ""
                        }
                    },
                    status_message: {
                        value: app.status_message || ""
                    }
                },
                key: index.toString(),
                type: "default",
                isSelected: false
            };
        })
    };
    
    // Update golden config UI states
    api.setState("gcRowData", gcTableData);
    api.setState("gcOrigRowData", gcTableData);
    api.setState("gcTableCount", gcTableData.rows.length);
    api.setState("gcUpdatesCount", gcUpdateCount);
    api.setState("gcNewCount", gcNewCount);
    
    // Update total counts to include golden config counts
    var regularUpdateCount = api.state.storePreviewTableCount || 0;
    var regularNewCount = api.state.newCount || 0;
    
    // Get regular app counts from rowData
    var rowData = api.state.rowData || { rows: [] };
    var regUpdateCount = 0;
    var regNewCount = 0;
    rowData.rows.forEach(function(row) {
        var currentVersion = row.cells.current_version?.value;
        var selectedVersion = row.cells.upgrade_version?.componentProps?.selectedItems?.[0];
        if (currentVersion === "Not Installed") {
            regNewCount++;
        } else if (selectedVersion && selectedVersion !== currentVersion) {
            regUpdateCount++;
        }
    });
    
    api.setState("updatesCount", regUpdateCount + gcUpdateCount);
    api.setState("newCount", regNewCount + gcNewCount);
    
    api.setState("goldenConfigApps", goldenConfigApps);  // Object format with app data

    api.data.test1_1.refresh();
}
