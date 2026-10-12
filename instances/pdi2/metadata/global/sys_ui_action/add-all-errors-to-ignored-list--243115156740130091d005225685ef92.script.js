addAllErrorsToIgnoredList();
function addAllErrorsToIgnoredList() {
	action.setRedirectURL(current);

	//get the client errors for this test
	var errorsGR = new GlideRecord("sys_atf_test_result_item");
	errorsGR.addQuery("test_result", current.sys_id);
	errorsGR.addQuery("type", "client_error").addOrCondition("type", "server_error");
	errorsGR.query();

	if (errorsGR.getRowCount() == 0) {
		gs.addInfoMessage(gs.getMessage("This test result does not have any client errors"), "ATF_No_Client_Errors");
		return false;
	}

	while (errorsGR.next()) {
		// if the error has a sys_atf_whitelist (Allowed Client Error) record, update it
		var whitelistedClientErrorSysId = new WhitelistedClientErrorUtil().getAllowListedErrorSysId(errorsGR);

		if (whitelistedClientErrorSysId != null) {
			// get sys_atf_whitelist error record
			var existingRecord = new GlideRecord('sys_atf_whitelist');
			existingRecord.get(whitelistedClientErrorSysId);

			// set active to true and report level to ignored
			existingRecord.active = true;
			existingRecord.report_level = 'ignored';
			existingRecord.description = errorsGR.description;
			existingRecord.error_location = errorsGR.type;
			existingRecord.test = current.test;
			existingRecord.update();
		} else {
			// add an entry for this error since it has not been added
			var gr = new GlideRecord('sys_atf_whitelist');
			gr.initialize();
			gr.error_message = errorsGR.output;
			gr.report_level = 'ignored';
			gr.error_location = errorsGR.type;
			gr.active = true;
			gr.description = errorsGR.description;
			gr.test = current.test;
			gr.insert();
			whitelistedClientErrorSysId = gr.getUniqueValue();
		}

		// set the test log's whitelisted_client_error (Allowed client error) field if not populated
		if (!errorsGR.getValue("whitelisted_client_error")) {
			errorsGR.setValue("whitelisted_client_error", whitelistedClientErrorSysId);
			errorsGR.update();
		}
	}

	gs.addInfoMessage(gs.getMessage("All the errors have been added to {0}the ignored list{1}", ["<a href='/sys_atf_whitelist_list.do?sysparm_query=active=true^test=" + current.test + "'>", "</a>"]), "ATF_Updated_Whitelist_For_Test");
}
