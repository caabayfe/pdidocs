(function executeRule(current, previous /*null when async*/ ) {
    var poWorkspaceId = "ae7a921553312010e7cdddeeff7b12ec"; // Process Mining Workspace
    var dashboardId = current.par_dashboard_id;

    var grVisibility = new GlideRecord("par_dashboard_visibility");
    grVisibility.addQuery("experience", poWorkspaceId);
    grVisibility.addQuery("dashboard", dashboardId);
    grVisibility.setLimit(1);
    grVisibility.query();
    if (!grVisibility.hasNext()) {
        grVisibility.initialize();
        grVisibility.experience = poWorkspaceId;
        grVisibility.dashboard = dashboardId;
        grVisibility.insert();
    }

})(current, previous);
