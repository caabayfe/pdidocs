if (!pm.isZboot()) {
	var newLabel = "Allowed Client Error";
	// change label on sys_db_object
	var dbObj = new GlideRecord("sys_db_object");
	dbObj.addQuery("name", "sys_atf_whitelist");
	dbObj.query();
	if (dbObj.next()) {
		var currentLabel = dbObj.getValue("label");
		if (currentLabel != newLabel) {
			dbObj.setValue("label", newLabel);
			dbObj.update();
			gs.log("Changed sys_db_object label for sys_atf_whitelist to " + newLabel);
		} else {
			gs.log("sys_db_object label for sys_atf_whitelist is already " + currentLabel);
		}
	}

	// change plural label on sys_documentation
	var newLabelPlural = "Allowed Client Errors";
	var docObj = new GlideRecord("sys_documentation");
	docObj.addQuery("name", "sys_atf_whitelist");
	docObj.addQuery("language", "en");
	docObj.addNullQuery("element");
	docObj.query();
	if(docObj.next()){
		var currentPlural = docObj.getValue("plural");
		if (currentPlural != newLabelPlural) {
			docObj.setValue("plural", newLabelPlural);
			docObj.update();
			gs.log("Changed sys_documentation plural label for sys_atf_whitelist to " + newLabelPlural);
		} else {
			gs.log("sys_documentation plural label for sys_atf_whitelist is already " + currentPlural);
		}
	}
	
	// change label on whitelisted_client_error column in sys_atf_test_result_item
	var newColName = "Allowed client error";
	var dictObj = new GlideRecord("sys_dictionary");
	dictObj.addQuery("name", "sys_atf_test_result_item");
	dictObj.addQuery("element", "whitelisted_client_error");
	dictObj.query();
	if (dictObj.next()) {
		var currentColName = dictObj.getValue("column_label");
		if (currentColName != newColName) {
			dictObj.setValue("column_label", newColName);
			dictObj.setValue("sys_name", newColName);
			dictObj.update();
			gs.log("Changed sys_dictionary label for whitelisted_client_error to " + newColName);
		} else {
			gs.log("sys_dictionary label for whitelisted_client_error is already " + currentColName);
		}
		
	}
}
