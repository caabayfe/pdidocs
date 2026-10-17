function onCondition() {
	if(g_form.getValue('account_link_type') == 'basic' || g_form.getValue('account_link_type') == '')
		g_form.setDisplay("automatic_link_action", false);
}
