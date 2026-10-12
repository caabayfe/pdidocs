(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	var displayLabel = sn_gf.GFUtil.getDisplayLabel();
	var assignedEntityConfigTableLabel = sn_gf.GFUtil.getTableLabel(sn_gf.GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
	gs.addErrorMessage(gs.getMessage("{0} relationships (m2m) cannot be created for the assigned entities defined in the {1} table.", [GlideStringUtil.escapeHTML(displayLabel), GlideStringUtil.escapeHTML(assignedEntityConfigTableLabel)]));

})(current, previous);
