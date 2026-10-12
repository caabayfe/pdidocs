addToWarnList();
function addToWarnList() {
	var goToWhitelistRecord = false;

	if (null != action.getValues().get('sysparm_referring_url') && action.getValues().get('sysparm_referring_url').indexOf("sys_atf_test_result_item_list") != -1) {
		// return to test log list
		var currentFilter = RP.getParameterValue('sysparm_query');
		action.setRedirectURL('sys_atf_test_result_item_list.do?sysparm_query=' + currentFilter);
	} else if (RP.toString().indexOf("sys_atf_test_result_item") != -1 || RP.toString().indexOf("sys_atf_whitelist") != -1) {
		// return to the occurrences related list on the sys_atf_test_result_item form or sys_atf_whitelist (Allowed Client Error) form
		// if the url does not have the sys_id of the current form, navigate to the updated sys_atf_whitelist record
		if (null != action.getValues().get('sysparm_referring_url') && action.getValues().get('sysparm_referring_url').indexOf("sys_id=") != -1)
			action.setRedirectURL(action.getValues().get('sysparm_referring_url').replace("@", "&"));
		else
			goToWhitelistRecord = true;
	} else {
		// return to the test log related list on test result form
		action.setRedirectURL('sys_atf_test_result.do?sys_id=' + current.test_result);
	}

	// show error message if test log is not a client error with a valid status
 	if (current.type != 'client_error' || (current.status != 'warning' &&
 										   current.status != 'ignored' &&
 										   current.status != 'failure')) {
		gs.addInfoMessage(gs.getMessage("Only client errors can be added to the warning list"), "ATF_Unable_to_Whitelist");
 		return false;
 	}

	// check if the error has a sys_atf_whitelist record
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
		existingRecord.test = current.test_result.test;
		existingRecord.description = current.description;
		existingRecord.update();

		// show info message if not redirected to the new sys_atf_whitelist record
		if (!goToWhitelistRecord)
			gs.addInfoMessage(gs.getMessage("This client error has been added to the warning list. {0}View it here{1}", ["<a href='/sys_atf_whitelist.do?sys_id=" + existingRecord.sys_id + "'>", "</a>"]));
		else
			action.setRedirectURL(existingRecord);

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

	// show info message if not redirected to the new sys_atf_whitelist record
	if (!goToWhitelistRecord)
		gs.addInfoMessage(gs.getMessage("This client error has been added to the warning list. {0}View it here{1}", ["<a href='/sys_atf_whitelist.do?sys_id=" + gr.sys_id + "'>", "</a>"]));
	else
		action.setRedirectURL(gr);

	// populate the whitelisted_client_error (Allowed client error) field of the test log failure record
	current.setValue("whitelisted_client_error", gr.getUniqueValue());
	current.update();
}
