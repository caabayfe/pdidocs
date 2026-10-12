/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  // Open the modal
    helpers.modal.open("dependencies_popup");
    api.setState("isDependenciesLoading", true);
    
    var installationBlockedCount = 0;
    
    // Get golden config apps from state
    var gcRowData = api.state.gcRowData || {};
    var gcRows = gcRowData.rows || [];
    var allApps = api.state.allApps || {};
    
    // Color mapping function for dependency status
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
            "not installed": { label: "Not Installed", color: "low" },
            "up to date": { label: "Up to date", color: "low" },
            "error": { label: "Error", color: "critical" }
        };
        
        var lowerStatus = status.toLowerCase();
        if (statusMap[lowerStatus]) {
            return statusMap[lowerStatus];
        }
        
        // Fallback: capitalize first letter for unknown statuses
        return {
            label: status.charAt(0).toUpperCase() + status.slice(1),
            color: "low"
        };
    }
    
    // Build dependencies array from golden config apps
    var dependencies = [];
    gcRows.forEach(function(row) {
        // Get scope from cells
        var scope = row.cells?.scope?.value;
        if (!scope) return;
        
        var app = allApps[scope];
        if (app) {
            // Get the selected version from the row cells
            var selectedVersion = row.cells?.selected_suite?.value || 
                                 row.cells?.checked_version?.value ||
                                 app.selected_suite || 
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
    
    // Build suite info
    var suiteInfo = {
        "selectedSuiteId": selectedSuiteSysId,
        "selectedAppId": latestSuite.sys_id || ""
    };
    
    // Set input state variables for the data broker
    api.setState("dependenciesInput", dependencies);
    api.setState("suiteInfoInput", suiteInfo);
    api.setState("targetReleaseInput", true);
    
    // Refresh the data broker
    api.data.get_incoming_dependencies_1.refresh();
}
