(function executeRule(current, previous /*null when async*/) {
	var targetType = !current.measure.choice_set && current.type != 'milestone'?'quantitative':'qualitative';
	if(!new TargetProgressUtil(current).logTargetProgress(targetType)){
			var targetLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE).toLowerCase();
			gs.addErrorMessage(gs.getMessage("Could not create {0} progress record.", GlideStringUtil.escapeHTML(targetLabel)));
	}
})(current, previous);
