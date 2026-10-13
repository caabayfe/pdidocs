(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isGroupEscalation = false;
	if (!current.isNewRecord()) {
		var ocRotation = new OnCallRotation();
		var isGroupEscalation = ocRotation.isGroupEscalationApplied(current.sys_id + '');
		g_scratchpad.isGroupEscalation = isGroupEscalation
		if (isGroupEscalation) {
			gs.addInfoMessage(new OnCallCommon().getGroupEscalationMessage('rota_form', current));
		}
	}

})(current, previous);
