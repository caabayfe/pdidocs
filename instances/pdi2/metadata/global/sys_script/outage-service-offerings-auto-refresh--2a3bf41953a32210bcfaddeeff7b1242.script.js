(function executeRule(current, previous /*null when async*/ ) {
    try {
        // Check if auto refresh is enabled
        var autoRefreshEnabled = gs.getProperty('com.snc.outage.auto_refresh_service_offerings', 'false') === 'true';
        if (!autoRefreshEnabled) {
            return;
        }

        // Only proceed if CI has changed
        if (current.cmdb_ci.changes()) {
            // Get a fresh GlideRecord to ensure we have all fields
            var outageGR = new GlideRecord('cmdb_ci_outage');
            if (!outageGR.get(current.sys_id)) {
                gs.error("Could not load outage record in business rule. Outage sys_id: " + current.sys_id);
                return;
            }

            var utils = new global.OutageServiceOfferingUtils();
            var result = utils.refreshAffectedServiceOfferings(outageGR);

            // Log any errors but don't show user messages in business rule
            if (!result.success) {
                gs.error("Error refreshing service offerings in business rule: " + result.message);
            }
        }
    } catch (ex) {
        gs.error("Error in Outage Service Offerings Business Rule: " + ex);
        // Don't show error message to user in business rule
    }
})(current, previous);
