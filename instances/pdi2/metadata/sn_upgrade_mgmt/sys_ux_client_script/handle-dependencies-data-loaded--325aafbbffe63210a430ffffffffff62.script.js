/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers}) {
    const result = api.data?.get_incoming_dependencies_1?.output;
    
    // Helper to reset state
    function resetState() {
        api.setState("dependenciesTableRows", []);
        api.setState("installationBlockedCount", 0);
        api.setState("totalDependenciesCount", 0);
        api.setState("isDependenciesLoading", false);
    }
    
    if (!result || !result.success) {
        resetState();
        return;
    }
    
    /**
     * Extract version from orig_string (format: "scope:version")
     * @param {string} origString - Original dependency string
     * @returns {string} Extracted version or empty string
     */
    function extractVersion(origString) {
        if (!origString) return "";
        const parts = origString.split(":");
        return parts.length === 2 ? parts[1] : "";
    }
    
    /**
     * Get status display properties based on status value
     * @param {string} status - Status string
     * @returns {object} Object with label and color properties
     */
    function getStatusProps(status) {
        if (!status) {
            return { label: "Unknown", color: "low" };
        }
        
        const statusMap = {
            "installation blocked": { label: "Installation Blocked", color: "critical" },
            "installed": { label: "Installed", color: "green" },
            "available": { label: "Available", color: "green" },
            "compatible": { label: "Compatible", color: "green" },
            "will be updated": { label: "Will be Updated", color: "green" },
            "will be installed": { label: "Will be Installed", color: "green" },
            "needs to be procured from store": { label: "Needs to be procured from Store", color: "low" },
            "needs to be installed": { label: "Needs to be Installed", color: "low" },
            "not installed": { label: "Not Installed", color: "low" },
            "up to date": { label: "Up to date", color: "low" },
            "error": { label: "Error", color: "critical" }
        };
        
        const lowerStatus = status.toLowerCase();
        return statusMap[lowerStatus] || { label: status, color: "low" };
    }
    
    // Transform dependencies into table rows
    const dependencies = result.dependencies || [];
    const rows = [];
    let installationBlockedCount = 0;
    
    dependencies.forEach((dep, index) => {
        const name = dep.Id || dep.scope || "Unknown";
        const type = dep.type || "Application";
        const currentVersion = extractVersion(dep.orig_string);
        const status = dep.status || "Unknown";
        
        // Build App Manager URL
        const appId = dep.source_app_id;
        const appUrl = appId && appId.length === 32
            ? "/now/app-manager/home/app/id/" + appId
            : "/now/app-manager/home/tab/updates/sort/recently_released";
        
        // Count installation blocked dependencies
        if (status.toLowerCase() === "installation blocked") {
            installationBlockedCount++;
        }

        rows.push({
            cells: {
                "app_name": {
                    value: appUrl,
                    label: name,
                    componentProps: {
                        href: appUrl,
                        label: name,
                        opensWindow: false  
                    }
                },
                "status": {
                    componentProps: getStatusProps(status),
                    value: getStatusProps(status).label,
                    label: getStatusProps(status).label
                },
                "current_version": {
                    value: currentVersion,
                    label: currentVersion
                }
            },
            key: index.toString(),
            type: "default"
        });
    });
    
    // Update state with processed data
    api.setState("dependenciesTableRows", rows);
    api.setState("installationBlockedCount", installationBlockedCount);
    api.setState("totalDependenciesCount", dependencies.length);
    api.setState("isDependenciesLoading", false);
}
