function onCondition() {
	if(g_form.getValue("sys_app") != '')
		g_form.setReadOnly("sys_app", true);
}
