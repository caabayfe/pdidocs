function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(isLoading && !g_form.newRecord)
		return;
	if(newValue === '') {
		setUIPolicyTableAccessProtection(false);
		return;
	}
	limitUIPolicyActionsOnOutOfScopeTables();
}

function limitUIPolicyActionsOnOutOfScopeTables() {
	
	var tableName = g_form.getValue("table");
	if(!isTableInScope(tableName)) {
		g_form.setValue("run_scripts",false);
		setUIPolicyTableAccessProtection(true);
	} else {
		// all capabilities are allowed for in scope tables
		setUIPolicyTableAccessProtection(false);
	}
}

function setUIPolicyTableAccessProtection(protect) {
	g_form.setReadOnly("run_scripts",protect);
	g_form.setReadOnly("script_true",protect);
	g_form.setReadOnly("script_false",protect);
}

function isTableInScope(tableName) {
	if(tableName === "")
		return true;
	var allowedTables = g_scratchpad.inScopeTableList;
	for(var i = 0;i<allowedTables.length;i++) {
		if(allowedTables[i] == tableName) {
			return true;
		}
	}
	return false;
}
