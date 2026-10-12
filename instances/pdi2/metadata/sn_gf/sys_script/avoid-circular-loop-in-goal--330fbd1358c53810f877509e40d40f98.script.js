(function executeRule(current, previous /*null when async*/) {

	if((new sn_gf.GFCoreGoal(current.getUniqueValue(),current)).isCircularLoopExists()) {
		var goalsLabel = sn_gf.GFUtil.getTablePluralLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
		gs.addErrorMessage(gs.getMessage( "Cannot add the {0} as a child of {1} as it creates a circular relationship between {2}.", [GlideStringUtil.escapeHTML(current.getDisplayValue()), GlideStringUtil.escapeHTML(current.getDisplayValue("parent_goal")), GlideStringUtil.escapeHTML(goalsLabel)]));
		current.setAbortAction(true);
	}
})(current, previous);
