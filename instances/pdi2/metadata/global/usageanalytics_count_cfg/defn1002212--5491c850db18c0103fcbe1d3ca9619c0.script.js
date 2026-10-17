answer = getRotateThroughMemberShifts();

/*
* Count the number of shifts with Rotate through members Escalation type
*/
function getRotateThroughMemberShifts() {
	var rowCount = 0;
	var gr = new GlideRecord('cmn_rota');
	gr.setCategory("usage");
	gr.addActiveQuery();
	gr.query();

	while (gr.next()) {
		var gr1 = new GlideRecord('cmn_rota_roster');
		gr1.setCategory("usage");
		gr1.addActiveQuery();
		gr1.addQuery('rota', gr.sys_id);
		gr1.query();
		if (gr.use_custom_escalation == false && gr1.getRowCount() == 1)
			rowCount++;
	}
	return rowCount;
}
