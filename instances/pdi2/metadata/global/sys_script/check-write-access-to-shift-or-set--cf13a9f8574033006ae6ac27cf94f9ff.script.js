(function executeRule(current, previous /*null when async*/) {

	var group = '';
	var groupName = '';
	if (current.type == 'rota') {
		group = current.cmn_rota.group + '';
		groupName = current.cmn_rota.group.getDisplayValue();
	}
	else if (current.type == 'escalation_set') {
		group = current.cmn_rota_escalation_set.cmn_rota.group + '';
		groupName = current.cmn_rota_escalation_set.cmn_rota.group.getDisplayValue();
	}
	if (group) {
		var hasWriteAccess = new OnCallSecurityNG().rotaMgrAccess(group);
		if (!hasWriteAccess) {
			gs.addErrorMessage(gs.getMessage("Doesn't have write access to the group {0}", groupName));
			current.setAbortAction(true);
		}
	}

})(current, previous);
