(function executeRule(current, previous /*null when async*/) {
    
	var assignedEntityList =  new sn_gf.GFGoal().getAssignedEntityReferenceFields();
	var numberOfOrganisationHierarchiesPopulated = 0;
	var assignedEntityFieldLabels = [];
	for(var i = 0; i < assignedEntityList.length; i++) {
		if(current.getValue(assignedEntityList[i].fieldName))
			numberOfOrganisationHierarchiesPopulated++;
		
		assignedEntityFieldLabels.push(assignedEntityList[i].fieldLabel);
	}
	if(numberOfOrganisationHierarchiesPopulated > 1) {
		var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
		gs.addErrorMessage(gs.getMessage('A {0} can be associated with only one of a {1}. Ensure that only one of these fields is populated.', [GlideStringUtil.escapeHTML(goalLabel), GlideStringUtil.escapeHTML(assignedEntityFieldLabels.join(", "))]));
		current.setAbortAction(true);
	}

})(current, previous);
