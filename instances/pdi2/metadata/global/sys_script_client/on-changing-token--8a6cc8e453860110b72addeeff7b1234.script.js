function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue == oldValue) {
        return;
    }
	
	// lowercase, replace . or space by _, remove special chars, remove trailing and leading _
	var cleanNewValue = (newValue == '*' || newValue == '**') ? newValue :
		newValue.toLowerCase().replace(/[\s\\.]/g, "_").replace(/([^a-z\d_])?(^[_]+)?([_]+$)?/g, "");
	if (cleanNewValue != newValue) {
		g_form.setValue("token", cleanNewValue);
		g_form.showFieldMsg("token", getMessage("Token should be a simple name"), "info");
		return;
	}
	
    var ga = new GlideRecord("sys_nowmq_subject");
    ga.addQuery("parent", g_form.getUniqueValue());
    ga.query();
    if (ga.next())
        g_form.showFieldMsg("token", getMessage("Changing the token will result in changes to the child subjects"), "warning");

}
