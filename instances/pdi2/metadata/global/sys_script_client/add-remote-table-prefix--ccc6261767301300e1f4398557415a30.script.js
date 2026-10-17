function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || !g_form.isNewRecord()) {
      return;
   }

	var name = g_form.getValue("name");
	var scope = g_form.getReference("sys_scope").getValue("scope");
	var prefix = scope == "global" ? "st_" : (scope + "_st_");
	
	if (newValue == "true" && !name.startsWith(prefix)) {
		g_form.setValue("name", "st_" + name.replace(scope, ""));
	}
	else if (newValue == "false" && name.startsWith(prefix)) {
		g_form.setValue("name", name.replace(prefix, ""));
	}
}
