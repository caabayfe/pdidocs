function onLoad() {
	var gr = new GlideRecord('sys_user_preference');
	gr.addQuery('name', 'alert_rule.type');
	gr.addQuery('user', g_user.userID);
	gr.query();
	if (gr.next()) {
		gr.setValue('value', g_form.getValue('type'));
		gr.update();
	}

   
}
