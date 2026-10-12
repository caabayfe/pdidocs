function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	toggleMandatoryAndVirtualField();
}

function toggleMandatoryAndVirtualField() {
	var tableName = g_form.getValue("name");
	if (!isTableInScope(tableName)) {
		if (g_form.newRecord)
			g_form.setValue("mandatory", false);
		g_form.setReadOnly("mandatory",true);
		
		if (!g_form.getBooleanValue("virtual"))
			g_form.setReadOnly("virtual", true);
		
	} else {
		if (!g_form.getBooleanValue("function_field"))
			g_form.setReadOnly("mandatory",false);
		g_form.setReadOnly("virtual", false);
	}
}

function isTableInScope(tableName) {
	if(tableName === "")
		return true;
	var allowedTables = g_scratchpad.inScopeTableList;
	for(var i = 0;i<allowedTables.length;i++) {
		if(allowedTables[i] == tableName)
			return true;
	}
	return false;
}
