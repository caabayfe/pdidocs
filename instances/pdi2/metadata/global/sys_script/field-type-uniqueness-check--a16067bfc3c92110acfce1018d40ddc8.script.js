(function executeRule(current, previous /*null when async*/ ) {
    var grAutomatedFindingDef = new GlideRecord("promin_automated_finding");
	
	if(!gs.nil(current.project)){
		grAutomatedFindingDef.addQuery("project", current.getValue("project"));
	}else{
		grAutomatedFindingDef.addQuery("process_def", current.getValue("process_def"));
	}
    grAutomatedFindingDef.addQuery("field", current.getValue("field"));
    grAutomatedFindingDef.addQuery("type", current.getValue("type"));
    if (current.operation() === 'update') {
        grAutomatedFindingDef.addQuery("sys_id", "!=", current.getUniqueValue());
    }
    grAutomatedFindingDef.setLimit(1);
    grAutomatedFindingDef.query();
    if (grAutomatedFindingDef.next()) {
        var link = "<a href='" + grAutomatedFindingDef.getLink() + "' target='_blank'>Click here</a>";
        gs.addErrorMessage(gs.getMessage("Duplicate Record: {0} to view the existing record.", link));
        current.setAbortAction(true);
		gs.setRedirectURL(current);
    }

})(current, previous);
