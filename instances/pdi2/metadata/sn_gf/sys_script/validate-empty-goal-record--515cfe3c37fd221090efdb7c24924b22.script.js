(function executeRule(current, previous /*null when async*/) {

	var displayLabel = sn_gf.GFUtil.getDisplayLabel();
	var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
    gs.addErrorMessage(gs.getMessage("A {0} relationship cannot be created without populating the {1} field.", [GlideStringUtil.escapeHTML(displayLabel), GlideStringUtil.escapeHTML(goalLabel)]));
    current.setAbortAction(true);

})(current, previous);
