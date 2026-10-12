function onCondition() {
	var tableName = g_form.getTableName();
	
	var optedOutTables = g_scratchpad.provider_content_ui_policy_opted_out_tables;
	if (optedOutTables) {
		var optedOutTableArray = optedOutTables.split(",");
		if (optedOutTableArray.includes(tableName))
			return;
	}
	
	g_form.setMandatory("notification", false);
	g_form.setDisplay("notification", false);
	g_form.setDisplay("notification.table", false);
}
