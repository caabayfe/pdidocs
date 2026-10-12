function onLoad() {
	// if nothing's editable, do nothing - avoids displaying wrong data 
	if (g_form.getEditableFields().length == 0)
		return;
		
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
