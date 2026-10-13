(function executeRule(current, previous /*null when async*/) {

	if (current.isNewRecord()) {
		var maxOrder = 0;
		var escalationSetGr = new GlideRecord('cmn_rota_escalation_set');
		if (current.getValue('cmn_rota')) {
			escalationSetGr.addQuery('cmn_rota', current.getValue('cmn_rota'));
		}
		else if (current.getValue('group_escalation')) {
			escalationSetGr.addQuery('group_escalation', current.getValue('group_escalation'));
		}
		escalationSetGr.orderByDesc('order');
		escalationSetGr.setLimit(1);
		escalationSetGr.query();
		if (escalationSetGr.next()) {
			if (escalationSetGr.getValue('order')) {
				maxOrder = escalationSetGr.getValue('order');
				maxOrder++;
			}
		}
		else {
			current.setValue('default', true);
		}
		current.setValue('order', maxOrder);
	}

})(current, previous);
