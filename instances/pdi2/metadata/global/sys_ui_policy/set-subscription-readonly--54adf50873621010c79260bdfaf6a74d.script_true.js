function onCondition() {
	var appSysId = g_form.getValue('table_ref.sys_scope');
	if (appSysId) {
		var msg = new GwtMessage().getMessage('ua_manage_app_subscription');
		g_form.addInfoMessage(formatMessage(msg, appSysId));
	}
}
