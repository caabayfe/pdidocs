(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	var goalTableLabel = sn_gf.GFUtil.getTableLabel(sn_gf.GoalFrameworkConstants.GOAL_TABLE);
	var assignedEntityTableLabel = sn_gf.GFUtil.getTableLabel(current.getValue('assigned_entity_table'));
	gs.addErrorMessage(gs.getMessage("A {0} assigned entity configuration already exists for the {1} table.", [GlideStringUtil.escapeHTML(goalTableLabel.toLowerCase()), GlideStringUtil.escapeHTML(assignedEntityTableLabel)]));

})(current, previous);
