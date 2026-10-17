function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '' || newValue == oldValue || typeof g_changed_widget != "undefined")
		return;

	if (g_form.isNewRecord()) {
		g_changed_widget = true;
		g_form.save();
		return;
	}
	g_old = oldValue;
	var widg = new GlideRecord("sp_widget");
	widg.query("sys_id", newValue, widgetResponse);
}

function widgetResponse(widgetGR) {
	if (!widgetGR.next())
		return;

	if (g_scratchpad.rect_type == widgetGR.data_table) {
		return;
	}
	
	var b = confirm("Changing the Widget saves the form with the required Rectangle type. Save with new value?");
	if (b) {
		g_changed_widget = true;
		g_form.save();
	} else
		g_form.setValue("sp_widget", g_old);
}
