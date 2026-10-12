(function executeRule(current, previous /*null when async*/) {
	// Array of terminal roles having name
	var terminalRoles = ['snc_external', 'snc_internal', 'snc_visitor'];
	//filter condition for aborting the action
	var curRoleName = current.role.getDisplayValue();
	for (var i=0; i< terminalRoles.length; i++) {
		if(terminalRoles[i] == curRoleName){
			current.setAbortAction(true);
			var message = gs.getMessage("{0} does not support contained roles.", current.role.getDisplayValue());
			gs.addErrorMessage(message);
			gs.error(message);
			break;
		}
	}
})(current, previous);
