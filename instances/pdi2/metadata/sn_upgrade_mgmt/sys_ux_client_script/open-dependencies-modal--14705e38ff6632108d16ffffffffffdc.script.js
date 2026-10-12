/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    helpers.modal.open("dependencies_modal");
    api.setState("isdependenciesLoading", true);
    
    var installationBlockedCount = 0;
    var gcRowData = api.state.gcRowData || {};
    var gcRows = gcRowData.rows || [];
    var allApps = api.state.allApps || {};
    console.log("All apps",allApps);
    function getStatusProps(status) {
        if (!status) {
            return {
                label: "Unknown",
                color: "low"
            };
        }
        
        var statusMap = {
            "installation blocked": { label: "Installation Blocked", color: "critical" },
            "installed": { label: "Installed", color: "green" },
            "available": { label: "Available", color: "green" },
            "compatible": { label: "Compatible", color: "green" },
            "will be updated": { label: "Will be updated", color: "green" },
            "will be installed": { label: "Will be installed", color: "green" },
            "not installed": { label: "Not Installed", color: "low" },
            "up to date": { label: "Up to date", color: "low" },
            "ready": { label: "Compatible", color: "green" },
            "error": { label: "Error", color: "critical" }
        };
        
        var lowerStatus = status.toLowerCase();
        if (statusMap[lowerStatus]) {
            return statusMap[lowerStatus];
        }
        return {
            label: status.charAt(0).toUpperCase() + status.slice(1),
            color: "low"
        };
    }
    
    // Build dependencies array from golden config apps
    var dependencies = [];
    gcRows.forEach(function(row) {
        var scope = row.cells?.scope?.value;
        if (!scope) return;
        
        var app = allApps[scope];
        if (app) {
            // Get the selected version from the row cells
            var selectedVersion = row.cells?.selected_version?.componentProps?.selectedItems?.[0] ||
                                 row.cells?.selected_version?.value || 
                                 row.cells?.checked_version?.value ||
                                 app.selected || 
                                 app.latest_available_version || 
                                 "";
            
            var dependencyEntry = {
                "scope": scope,
                "version": selectedVersion,
                "dependencies": app.dependencies || ""
            };
            dependencies.push(dependencyEntry);
        }
    });
    
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
    
    // Build request payload
    var requestPayload = {
        "dependencies": dependencies,
        "suiteInfo": {
            "selectedSuiteId": selectedSuiteSysId,
            "selectedAppId": latestSuite.sys_id || ""
        }
    };
    console.log("dependencies payload",requestPayload);
    helpers.snHttp(
        '/api/sn_appclient/v1/appmanager/batch/dependencies?targetRelease=false',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestPayload
        }
    ).then(response => {
        // Store the full response in state
        api.setState("dependenciesResponse", response);
        console.log("dependenciesresponse",response);
        // Parse dependencies from the API response
        const dependencies = 
            response?.result?.dependencies ||
            response?.response?.result?.dependencies ||
            [];
        api.setState("totalDependenciesCount", dependencies.length);
        const rows = [];
        
        dependencies.forEach((dep, index) => {
            // Name from Id field
            const name = dep.Id || dep.scope || "Unknown";
            
            // Type from type field
            const type = dep.type || "Application";
            
            // Target Version from minVersion field
            const targetVersion = dep.minVersion || "";
            
            // Status from status field
            const status = dep.status || "Unknown";
            
            // Build App Manager URL
            const appId = dep.source_app_id;
            const appUrl = appId && appId.length === 32
                ? "/now/app-manager/home/app/id/" + appId
                : "/now/app-manager/home/tab/updates/sort/recently_released";
            
            if(status.toLowerCase() == "installation blocked")
                installationBlockedCount++;

            rows.push({
                cells: {
                    "app_name": {
                        value: appUrl,
                        label: name,
                        componentProps: {
                            href: appUrl,
                            label: name && name.indexOf("@") === 0 
                                ? " " + name 
                                : (name || ""),
                            opensWindow: false  
                        }
                    },
                    "type": {
                        value: type,
                        label: type
                    },
                    "target_version": {
                        value: targetVersion,
                        label: targetVersion
                    },
                    "status": {
                        componentProps: getStatusProps(status),
                        value: getStatusProps(status).label,
                        label: getStatusProps(status).label
                    }
                },
                "key": index.toString(),
                "type": "default"
            });
        });
        
        // Set the rows data
        api.setState("dependenciesTableRows", rows);
        api.setState("installationBlockedCount", installationBlockedCount);
        api.setState("isdependenciesLoading", false);
    })
    .catch(error => {
        console.error('Dependencies API error:', error);
        api.setState("dependenciesTableRows", []);
        api.setState("isdependenciesLoading", false);
    });
}
