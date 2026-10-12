answer = getKBUseESSUsers();

function getKBUseESSUsers () {
	if (!GlideTableDescriptor.isValid('kb_use'))
		return 0;
	var ga = new GlideAggregate('kb_use');
	ga.groupBy('user');
	ga.addAggregate('COUNT', 'user');
	ga.query();
	var numRecs = 0;
	while (ga.next()) {
		var uid = ga.getValue('user');
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('user', uid);
		gr.query();
		if (gr.getRowCount() == 0) 
			numRecs += parseInt(ga.getAggregate('COUNT', 'user'));
	}
	return numRecs;
}
