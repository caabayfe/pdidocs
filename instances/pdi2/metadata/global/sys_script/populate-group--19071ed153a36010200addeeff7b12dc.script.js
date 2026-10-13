(function executeRule(current, previous /*null when async*/) {

	if (current.cmn_rota + '') {
		current.group = current.cmn_rota.group + '';
	}
	else {
		if (current.group_escalation + '') {
			current.group = current.group_escalation.group + '';
		}
	}

})(current, previous);
