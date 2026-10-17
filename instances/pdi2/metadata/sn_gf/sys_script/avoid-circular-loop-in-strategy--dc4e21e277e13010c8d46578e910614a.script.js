(function executeRule(current, previous /*null when async*/) {

	if(GFUtil.checkCircularLoop(current.getUniqueValue(),current.getValue("parent"), GoalFrameworkConstants.STRATEGY_TABLE)) {
		gs.addErrorMessage(gs.getMessage( "Cannot add the {0} as a child of {1} as it creates a circular relationship between strategies.", [GlideStringUtil.escapeHTML(current.getDisplayValue()), GlideStringUtil.escapeHTML(current.getDisplayValue("parent"))]));
		current.setAbortAction(true);
	}

})(current, previous);
