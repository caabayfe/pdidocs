(function executeRule(current, previous /*null when async*/ ) {
    var usedInDashboard = true;
    if (current.operation() === 'delete') {
        // Check if the visualization is not used in other dashboards
        var gr = new GlideRecord("par_visualization");
        gr.addQuery("sys_id", current.stored_component);
        gr.addEncodedQuery("^RLQUERYpar_dashboard_widget.stored_component,>=1^stored_componentISNOTEMPTY^ENDRLQUERY");
        gr.query();
        if (!gr.next())
            usedInDashboard = false;
    }

    updateMetadataRecord(current, usedInDashboard);

})(current, previous);

function updateMetadataRecord(current, usedInDashboard) {
    var visMetadataGr = new GlideRecord("analytics_visualization_metadata");
    visMetadataGr.addQuery("visualization", current.stored_component);
    visMetadataGr.query();
    if (visMetadataGr.next()) {
        visMetadataGr.setValue("used_in_dashboard", usedInDashboard);
        visMetadataGr.update();
    }
}
