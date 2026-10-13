(function executeRule(current, previous /*null when async*/) {
	var isGroupEscalation = false;

	var gr = new GlideRecord('cmn_rota_escalation_set');
	gr.addActiveQuery();
	if (current.getValue('cmn_rota')) {
		gr.addQuery('cmn_rota', current.cmn_rota + '');
	}
	else if (current.getValue('group_escalation')) {
		isGroupEscalation = true;
		gr.addQuery('group_escalation', current.group_escalation + '');
	}
	gr.addQuery('default', true);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.setLimit(1);
	gr.query();
	if (!gr.hasNext()) {
		if (isGroupEscalation) {
			var msg = gs.getMessage('Selected group escalation {0} should have atleast one default escalation set', [current.group_escalation.getDisplayValue()]);
		}
		else {
			var msg = gs.getMessage('Selected Shift {0} should have atleast one default escalation set', [current.cmn_rota.getDisplayValue()]);
		}
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}	
})(current, previous);
