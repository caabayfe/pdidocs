(function executeRule(current, previous /*null when async*/) {

	var isGroupEscalation = false;
	var escalationSetGr = new GlideRecord('cmn_rota_escalation_set');
	if (current.getValue('cmn_rota')) {
		escalationSetGr.addQuery('cmn_rota', current.getValue('cmn_rota'));
	}
	else if (current.getValue('group_escalation')) {
		isGroupEscalation = true;
		escalationSetGr.addQuery('group_escalation', current.getValue('group_escalation'));
	}
	escalationSetGr.addQuery('default', true);
	escalationSetGr.addQuery('sys_id', '!=', current.getUniqueValue());
	escalationSetGr.addActiveQuery();
	escalationSetGr.setLimit(1);
	escalationSetGr.query();
	if (escalationSetGr.next()) {
		escalationSetGr.setValue('active', false);
		escalationSetGr.update();
	}

})(current, previous);
