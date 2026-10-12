/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    helpers
}) {
    helpers.modal.open('progress_tracker');     
    var gcRowData = api.state.gcRowData || {};
    var gcRows = gcRowData.rows || [];

    if (gcRows.length === 0) {
        return;
    }
    
    function renderAccordionHTML(data) {
        function getStatusText(item, percentComplete) {
            if (item.state === '2' && percentComplete === 100) {
                return 'Succeeded 100%';
            }
            if (item.state === '3') {
                return 'Failed ' + percentComplete + '%';
            }
            return 'Running ' + percentComplete + '%';
        }

        function getProgressLabel(item, percentComplete) {
            if (item.state === '2' && percentComplete === 100) {
                return item.duration ? 'Succeeded in ' + item.duration : 'Succeeded';
            }
            return item.message;
        }

        function getPathType(item) {
            if (item.state === '3') return 'error';
            return 'initial';
        }

        function getHeaderLabel(item, isRoot) {
            if (isRoot) {
                if (item.name === "UpgradeManagementConsoleSuiteUpdate_") return "Suite Update";
                if (item.name.startsWith("UpgradeManagementConsoleSuiteUpdate_")) {
                    var label = item.name.split("_")[1] || item.name;
                    return label.startsWith("@") ? "\u200B" + label : label;
                }
            }
            return item.name;
        }

        function renderItems(items, level) {
            var html = '';
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var hasChildren = item.children && item.children.length > 0;
                var percentComplete = Number(item.percent_complete || 0);
                var header = getHeaderLabel(item, level === 0);

                html += '<now-accordion-item expanded header="' + header + '">';
                html += '<div slot="metadata" style="display:flex;gap:0.5rem;align-items:center">';
                html += '<arc-heading level="4">' + getStatusText(item, percentComplete) + '</arc-heading>';
                if (percentComplete !== 100) {
                    html += '<now-loader size="sm"></now-loader>';
                }
                html += '</div>';
                html += '<div slot="content">';
                html += '<now-progress-bar value="' + percentComplete + '" ';
                html += 'label="' + getProgressLabel(item, percentComplete).replace(/"/g, '&quot;') + '" ';
                html += 'path-type="' + getPathType(item) + '" ';
                html += 'size="sm" label-position="bottom" max="100">';
                html += '</now-progress-bar>';

                if (hasChildren) {
                    html += '<now-accordion heading-level="5" hide-dividers trigger-icon=\'{"position":"start"}\'>';
                    html += renderItems(item.children, level + 1);
                    html += '</now-accordion>';
                }

                html += '</div></now-accordion-item>';
            }
            return html;
        }

        return '<now-accordion heading-level="5" hide-dividers trigger-icon=\'{"position":"start"}\'>' +
            renderItems([data], 0) +
            '</now-accordion>';
    }
    
    function getCurrentDateTime() {
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = String(currentDate.getMonth() + 1).padStart(2, '0');
        var day = String(currentDate.getDate()).padStart(2, '0');
        var hours = String(currentDate.getHours()).padStart(2, '0');
        var minutes = String(currentDate.getMinutes()).padStart(2, '0');
        var seconds = String(currentDate.getSeconds()).padStart(2, '0');
        return year + '-' + month + '-' + day + '-' + hours + '-' + minutes + '-' + seconds;
    }

    function stopPolling() {
        api.data.get_app_upgrade_list_1.refresh();
        helpers.timing.setTimeout(function() {
            if (this.window.suiteProgressInterval) {
                helpers.timing.clearInterval(this.window.suiteProgressInterval);
                this.window.suiteProgressInterval = null;
            }
        }, 0);
    }
    function fetchDependenciesAndInstall() {
        var allApps = api.state.allApps || {};
        
        // Build dependencies array from golden config apps
        var dependencies = [];
        for (var i = 0; i < gcRows.length; i++) {
            var row = gcRows[i];
            var scope = row.cells?.scope?.value;
            if (!scope) continue;
            
            var app = allApps[scope];
            if (app) {
                var selectedVersion = row.cells?.selected_version?.componentProps?.selectedItems?.[0] ||
                                     row.cells?.selected_version?.value || 
                                     "";
                
                if (selectedVersion) {
                    dependencies.push({
                        scope: scope,
                        version: selectedVersion,
                        dependencies: app.dependencies || ""
                    });
                }
            }
        }
        
        // Get suite info from state
        var selectedSuiteVersion = api.state.selectedSuiteVersion || "";
        var suiteVersions = api.state.suiteVersions || [];
        var latestSuite = api.state.latestSuite || {};
        
        // Find the selected suite sys_id
        var selectedSuiteSysId = "";
        for (var i = 0; i < suiteVersions.length; i++) {
            if (suiteVersions[i].version === selectedSuiteVersion) {
                selectedSuiteSysId = suiteVersions[i].sys_id || "";
                break;
            }
        }
        
        // Build request payload to get dependencies
        var dependenciesRequestPayload = {
            dependencies: dependencies,
            suiteInfo: {
                selectedSuiteId: selectedSuiteSysId,
                selectedAppId: latestSuite.sys_id || ""
            }
        };
        
        console.log("Fetching dependencies with payload:", JSON.stringify(dependenciesRequestPayload, null, 2));
        
        // Fetch dependencies from the API
        helpers.snHttp('/api/sn_appclient/v1/appmanager/batch/dependencies?targetRelease=false', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: dependenciesRequestPayload
        }).then(function(response) {
            console.log("Dependencies API response:", response);
            
            // Parse dependencies from the response
            var apiDependencies = response?.result?.dependencies ||
                                 response?.response?.result?.dependencies ||
                                 [];
            
            // Now build the install payload with dependencies
            buildAndCallBatchInstall(apiDependencies);
            
        }).catch(function(error) {
            console.error("Dependencies fetch error:", error);
        });
    }

    function buildAndCallBatchInstall(apiDependencies) {
    var packages = [];
    var addedAppIds = {}; // Track added apps to prevent duplicates
    
    // Get suite information first
    var selectedSuiteVersion = api.state.selectedSuiteVersion || "";
    var latestSuite = api.state.latestSuite || {};
    var parentAppId = latestSuite.sys_id || ""; // This is the parent application ID
    
    // First, identify and add dependencies
    if (apiDependencies && apiDependencies.length > 0) {
        apiDependencies.forEach(function(dep) {
            var depId = dep.source_app_id || dep.id;
            var depVersion = dep.minVersion || dep.version;
            var depName = dep.Id || dep.name || dep.scope;
            
            if (depId && depVersion && !addedAppIds[depId]) {
                packages.push({
                    id: depId,
                    type: "application",
                    requested_version: String(depVersion),
                    load_demo_data: false,
                    notes: "Dependency: " + depName
                });
                addedAppIds[depId] = true;
            }
        });
    }
    
    // Then, add apps from gcRows with proper classification
    for (var i = 0; i < gcRows.length; i++) {
        var row = gcRows[i];
        var cells = row.cells;
        
        var selectedVersion = cells.selected_version?.componentProps?.selectedItems?.[0] || 
                             cells.selected_version?.value || 
                             "";
        
        var href = cells.app_name?.componentProps?.href || "";
        var appId = href.split('/').pop(); 
        var appName = cells.app_name?.value || cells.app_name?.label || "Unknown App";
        
        if (!selectedVersion || !appId) {
            console.warn("Skipping app - missing version or ID:", appName);
            continue;
        }
        
        // Skip if already added as dependency
        if (addedAppIds[appId]) {
            console.log("Skipping duplicate app:", appName);
            continue;
        }
        
        // Classify based on relationship to parent
        var notePrefix = "";
        if (appId === parentAppId) {
            notePrefix = "Parent Application: ";
        } else {
            notePrefix = "Sibling Application: ";
        }
        
        packages.push({
            id: appId,
            type: "application",
            requested_version: String(selectedVersion),
            load_demo_data: false,
            notes: notePrefix + appName
        });
        addedAppIds[appId] = true;
    }
    
    if (packages.length === 0) {
        console.error("No packages to install");
        return;
    }
    
    // Get first app info for naming
    var firstAppName = gcRows[0]?.cells?.app_name?.value || gcRows[0]?.cells?.app_name?.label || "Apps";
    var firstAppSysId = gcRows[0]?.cells?.app_sys_id?.value;
    var suiteVersions = api.state.suiteVersions || [];
    
    // Find the suite sys_id for gc_id
    var gcId = "";
    for (var i = 0; i < suiteVersions.length; i++) {
        if (suiteVersions[i].version === selectedSuiteVersion) {
            gcId = suiteVersions[i].sys_id || getCurrentDateTime();
            break;
        }
    }
    if (!gcId) {
        gcId = getCurrentDateTime();
    }
    
    // Build the complete payload in the exact format requested
    var payload = {
        install_plan: {
            packages: packages,
            product_id: firstAppSysId || getCurrentDateTime(),
            name: "Suite Install for " + firstAppName + " " + selectedSuiteVersion,
            notes: "gc_id:" + gcId
        },
        type: "application"
    };
    
    console.log("Final install payload:", JSON.stringify(payload, null, 2));    
    helpers.snHttp('/api/sn_appclient/v1/appmanager/product/install', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    }).then(function(response) {
        console.log("Batch install response:", response);
        
        var responseData = response?.response || response;
        var result = responseData?.result || {};
        var batchInfo = result.batchInfo || {};
        
        var trackerId = result.trackerId || 
                       batchInfo.execution_tracker_id || 
                       result.execution_tracker_id;
        
        console.log("Tracker ID:", trackerId);

        api.data.record_watcher_1.subscribe({
            table: 'sys_execution_tracker',
            filterConditions: `sys_id=${trackerId}`,
            subscribe: true
        });
        
        if (trackerId) {
            api.setState("gctracker", trackerId);
            startProgressTracking(trackerId);
        } else {
            console.error("No tracker ID in response!");
            api.data.get_app_upgrade_list_1.refresh();
        }
    }).catch(function(error) {
        console.error("Batch install error:", error);
        api.data.get_app_upgrade_list_1.refresh();
    });
}
    function startProgressTracking(trackerId) {        
        // Open modal immediately
        // helpers.modal.open('progress_tracker');     
        // Function to fetch tracker data and update state with retry logic
        function fetchAndUpdateTracker(maxRetries = 5, attempt = 1) { 
            var bodyParams =
                "sysparm_processor=AJAXProgressStatusChecker" +
                "&sysparm_scope=global" +
                "&sysparm_want_session_messages=true" +
                "&sysparm_name=getStatus" +
                "&sysparm_execution_id=" + trackerId +
                "&ni.nolog.x_referer=ignore" +
                "&x_referer=batchInstallPopup.do%3Fexecution_tracker_id%3D" + trackerId + "%26sysparm_use_polaris%3Dtrue";

            helpers.snHttp("/xmlhttp.do", {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: bodyParams
            })
            .then(function(response) {
                var rawXml = "";
                if (response && response.response) {
                    rawXml = Object.values(response.response).join("");
                }

                var match = rawXml.match(/answer="([\s\S]*?)"/);

                if (match && match[1]) {
                    try {
                        var trackerData = JSON.parse(
                            match[1]
                            .replace(/&quot;/g, '"')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&')
                        );
                        
                        var state = trackerData?.state;                
                        if (trackerData) {
                            var htmlData = renderAccordionHTML(trackerData);
                            api.setState("gctrackerState",state);
                            api.setState('gcprogressTrackerHtmlString', htmlData);
                            if (state === '2') {
                                console.log("Update COMPLETE");
                                stopPolling();
                            } else if (state === '3') {
                                console.log("Update FAILED");
                                stopPolling();
                            }
                        }
                    } catch (e) {
                        console.error("Parse error:", e);
                        api.setState('gcprogressTrackerHtmlString', "<div>Error parsing tracker data</div>");
                    }
                }
            })
            .catch(function(error) {
                if (attempt < maxRetries) {
                    helpers.timing.setTimeout(function() {
                        fetchAndUpdateTracker(maxRetries, attempt + 1);
                    }, 500);
                } else {
                    api.setState('gcprogressTrackerHtmlString', "<div>Error fetching progress status after multiple attempts</div>");

                }
            });
        }

        // // Start continuous polling every 2 seconds
        // helpers.timing.setTimeout(function() {
        //     this.window.suiteProgressInterval = helpers.timing.setInterval(fetchAndUpdateTracker, 2000);
        // }, 0);

        // // Initial fetch
        // fetchAndUpdateTracker();
    }
    fetchDependenciesAndInstall();
} 
