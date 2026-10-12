(function executeRule(current, previous /*null when async*/ ) {
    var usedInDashboard = true;
    if (current.operation() === 'delete') {
		// Check if the report is not used in other dashboards
        var gr = new GlideRecord("sys_report");
        gr.addQuery("sys_id", current.value);
        gr.addEncodedQuery("^RLQUERYsys_portal_preferences.value,>=1^valueISNOTEMPTY^ENDRLQUERY");
        gr.query();
        if (!gr.next()) 
            usedInDashboard = false;
    }

    updateMetadataRecord(current, usedInDashboard);

})(current, previous);

function updateMetadataRecord(current, usedInDashboard) {
    var visMetadataGr = new GlideRecord("analytics_visualization_metadata");
    visMetadataGr.addQuery("visualization", current.value);
    visMetadataGr.query();
    if (visMetadataGr.next()) {
        visMetadataGr.setValue("used_in_dashboard", usedInDashboard);
        visMetadataGr.update();
    }
}
