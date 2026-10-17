function getTableTypeQuery() {
	var type;
	var gr = new GlideRecord('sys_user_preference');
	gr.addQuery('name', 'alert_rule.type');
	gr.addQuery('user', gs.getUserID());
	gr.query();
	if (gr.next()) {
		type = gr.getValue('value');
	}
	else {
		type = 'incident';
	}
	var query = 'active=true^table=' + type;
    return query;
}
