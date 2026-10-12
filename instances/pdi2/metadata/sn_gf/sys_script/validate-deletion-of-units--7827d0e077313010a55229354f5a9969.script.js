(function executeRule(current, previous /*null when async*/) {

	var targetGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
	targetGr.addQuery('measure', current.getUniqueValue());
	targetGr.query();
	if(targetGr.hasNext()) {
		var targetLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE).toLowerCase();
		gs.addErrorMessage(gs.getMessage("This record cannot be deleted as it has {0}(s) associated to it.", GlideStringUtil.escapeHTML(targetLabel)));
		current.setAbortAction(true);
	}

})(current, previous);
