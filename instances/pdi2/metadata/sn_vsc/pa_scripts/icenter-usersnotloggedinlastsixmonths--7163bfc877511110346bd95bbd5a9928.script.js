UsersNotLoggedInLastSixMonths();

function UsersNotLoggedInLastSixMonths() {
	var gr = new GlideAggregate('sys_user');
	var start = new GlideDateTime(score_start.getGlideObject().toString());
    start.addMonthsLocalTime(-6);
	gr.addEncodedQuery('active=true^last_login<' + start, true);
	if (new GlideRecord('sys_user').isValidField('identity_sub_type'))
        gr.addEncodedQuery('identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY', true);
	gr.addAggregate('COUNT');
	gr.query();
	
	if (gr.next()) {
		return gr.getAggregate('COUNT');
	}
	return 0;
}
