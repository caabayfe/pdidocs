(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.isRegularFindingPresent = isRegularFindingPresent();

    function isRegularFindingPresent() {
        var grFindingDef = new GlideRecord("promin_finding_def");
        grFindingDef.addQuery("project", current.getUniqueValue());
        grFindingDef.query();
        return grFindingDef.hasNext();
    }

    g_scratchpad.isAutomatedFindingPresent = isAutomatedFindingPresent();

    function isAutomatedFindingPresent() {
        var grAutomatedFinding = new GlideRecord("promin_automated_finding");
        grAutomatedFinding.addQuery("project", current.getUniqueValue());
        grAutomatedFinding.query();
        return grAutomatedFinding.hasNext();
    }

	g_scratchpad.showImportMsg = new global.ProminUIAction().showImportProcessFindingTemplates(current);

})(current, previous);
