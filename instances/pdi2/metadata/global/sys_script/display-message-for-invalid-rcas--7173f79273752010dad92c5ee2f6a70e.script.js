(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (current.isNewRecord())
		return;
	
	gs.addErrorMessage(gs.getMessage("This record is a Requested Restricted Caller Access Privilege generated in the source application and is ignored for access privileges. A Real RCA must be in the target scope '{0}' but is in source scope '{1}' and is ignored for access calculation. Please contact your administrator",[current.getDisplayValue('target_scope'),current.getDisplayValue('sys_scope')]));

})(current, previous);
