addToWarnList();
function addToWarnList() {
	action.setRedirectURL(current);

	// check if the error has a sys_atf_whitelist (Allowed Client Error) record
	var whitelistedClientErrorSysId = new WhitelistedClientErrorUtil().getWhitelistedClientErrorSysId(current);
	var link;
	var message;

	if (whitelistedClientErrorSysId != null) {
		// get sys_atf_whitelist error record
		var existingRecord = new GlideRecord('sys_atf_whitelist');
		existingRecord.get(whitelistedClientErrorSysId);

		// set active to true and report level to warning
		existingRecord.active = true;
		existingRecord.report_level = 'warning';
		existingRecord.description = current.description;
		existingRecord.test = current.test_result.test;
		existingRecord.update();

		gs.addInfoMessage(gs.getMessage("This client error has been added to the warning list. {0}View it here{1}", ["<a href='/sys_atf_whitelist.do?sys_id=" + existingRecord.sys_id + "'>", "</a>"]));

		// set the test log's whitelisted_client_error (Allowed client error) field if not populated
		if (!current.getValue("whitelisted_client_error")) {
			current.setValue("whitelisted_client_error", whitelistedClientErrorSysId);
			current.update();
		}
		return true;
	}

	// add an entry for this error since it has not been added
	var gr = new GlideRecord('sys_atf_whitelist');
	gr.initialize();
	gr.error_message = current.output;
	gr.report_level = 'warning';
 	gr.active = true;
	gr.description = current.description;
	gr.test = current.test_result.test;
 	gr.insert();

	gs.addInfoMessage(gs.getMessage("This client error has been added to the warning list. {0}View it here{1}", ["<a href='/sys_atf_whitelist.do?sys_id=" + gr.sys_id + "'>", "</a>"]));

	// populate the whitelisted_client_error field of the test log failure record
	current.setValue("whitelisted_client_error", gr.getUniqueValue());
	current.update();
}
