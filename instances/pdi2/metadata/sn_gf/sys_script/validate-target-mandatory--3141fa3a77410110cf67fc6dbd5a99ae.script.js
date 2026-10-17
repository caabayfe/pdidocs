(function executeRule(current, previous /*null when async*/ ) {
    var errorMsg;
    if (!current.getValue("name"))
        errorMsg = gs.getMessage("Name field is mandatory.");
    else if (!current.getValue("goal")){
		var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE);
        errorMsg = gs.getMessage("{0} field is mandatory.", GlideStringUtil.escapeHTML(goalLabel));
	}
    if (errorMsg) {
        gs.addErrorMessage(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
