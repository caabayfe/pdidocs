(function executeRule(current, previous /*null when async*/) {
var userCriteriaMapping = new GlideRecord("sys_sg_user_criteria_mapping");
	userCriteriaMapping.addQuery("user_criteria", current.user_criteria);
	userCriteriaMapping.addQuery("mobile_entity", current.mobile_entity);
	if (current.operation() == "update")
		userCriteriaMapping.addQuery("sys_id", "!=", current.sys_id);
		
	userCriteriaMapping.query();
	if (userCriteriaMapping.getRowCount() > 0) {
		var errorMsg = gs.getMessage("The selected mobile entity already has a mapping to the selected user criteria.");
		gs.addErrorMessage(errorMsg);
		current.setAbortAction(true);
	}

})(current, previous);
