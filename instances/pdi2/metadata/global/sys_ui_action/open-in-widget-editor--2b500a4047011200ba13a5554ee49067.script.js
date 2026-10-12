function openWidgetEditor() {
	var id = "";
	if (typeof g_form != "undefined")
		id = g_form.getUniqueValue();
	else
		id = g_sysId;
	window.open("sp_config?id=widget_editor&sys_id=" + id, "sp_config");	
}
