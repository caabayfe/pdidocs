gs.print("Update scope and package of core ui dashboard");
var paDashboardGr = new GlideRecord("pa_dashboards");
paDashboardGr.addEncodedQuery("experience_dashboard!=NULL"); //query dashboard that has already been migrated
paDashboardGr.query();

while (paDashboardGr.next()) {
    //Get next experience dashboard
    var experienceDashboard = paDashboardGr.experience_dashboard.getRefRecord();
    // Only update scope and package if record has valid experience_dashboard, scope, and package fields
    if (experienceDashboard && experienceDashboard.isValidRecord()) {
        var sysPackage = experienceDashboard.sys_package;
        var sysScope = experienceDashboard.sys_scope;
        if (sysPackage || sysScope) {
            // Create DBQuery to identify the specific record
            var q = new GlideDBQuery("pa_dashboards");
            q.addQuery("sys_id", paDashboardGr.sys_id);

            // Create DBUpdate and set the query
            var dbUpdate = new GlideDBUpdate("pa_dashboards");
            dbUpdate.setQuery(q);

            // Set the values to update
            if (sysPackage)
                dbUpdate.setValue("sys_package", sysPackage);
            if (sysScope)
                dbUpdate.setValue("sys_scope", sysScope);

            try {
                dbUpdate.execute();
            } finally {
                dbUpdate.close();
                q.close();
            }
        }
    }
}
gs.print("Finish update scope and package of core ui dashboard");
