(function executeRule(current, previous /*null when async*/ ) {
    var grAutomatedFindingDef = new GlideRecord("promin_automated_finding");
	grAutomatedFindingDef.addQuery("project", current.getValue("project"));
    grAutomatedFindingDef.query();
    var limit = gs.getProperty("promin.limit.automated_finding", 15);
    if (grAutomatedFindingDef.getRowCount() >= limit) {
        var msgArray = [];
        msgArray.push(limit);
        gs.addErrorMessage(gs.getMessage("Maximum ({0}) Automated finding definitions are allowed for a project",
            msgArray));
        current.setAbortAction(true);
    }

})(current, previous);
