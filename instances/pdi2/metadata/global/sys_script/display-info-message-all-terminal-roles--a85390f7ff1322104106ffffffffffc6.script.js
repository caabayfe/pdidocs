(function executeRule(current, previous /*null when async*/) {
	// Array of terminal roles having name
	var terminalRoles = ['snc_external', 'snc_internal', 'snc_visitor'];
	var curRoleName = current.getElement('name').getValue();
	var isTerminal = false;
	for (i =0; i< terminalRoles.length;i++){
		if (terminalRoles[i] == curRoleName){
			isTerminal = true;
			break;
		}
	}
	if(isTerminal)
		gs.addInfoMessage(gs.getMessage("{0} does not support contained roles. Please refrain from adding any contained roles.", current.name.getDisplayValue()));

})(current, previous);
