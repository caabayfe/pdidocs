function changeCurrentSet() {
	if (typeof rowSysId == 'undefined')
		sysId = g_form.getUniqueValue();
	else
		sysId = rowSysId;

	var ajax = new GlideAjax("UpdateSetAjax");
	ajax.addParam("sysparm_type", "changeUpdateSet");
	ajax.addParam("sysparm_value", sysId);
	ajax.getXML(function changeUpdateSetResponse() {
		if (window.g_form)
			g_navigation.reloadWindow();
	});
}
