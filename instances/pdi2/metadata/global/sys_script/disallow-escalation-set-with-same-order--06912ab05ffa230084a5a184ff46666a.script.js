(function executeRule(current, previous /*null when async*/) {

	var escalationSetGr = new GlideRecord('cmn_rota_escalation_set');
	if (current.getValue('cmn_rota')) {
		escalationSetGr.addQuery('cmn_rota', current.getValue('cmn_rota'));
	}
	else if (current.getValue('group_escalation')) {
		escalationSetGr.addQuery('group_escalation', current.getValue('group_escalation'));
	}
	
	escalationSetGr.addQuery('order', current.getValue('order'));
	escalationSetGr.addQuery('sys_id', 'NOT IN', current.getUniqueValue());
	escalationSetGr.addActiveQuery();
	escalationSetGr.setLimit(1);
	escalationSetGr.query();
	if (escalationSetGr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Escalation set with order - {0} already exists', current.order));
		current.setAbortAction(true);
	}

})(current, previous);
