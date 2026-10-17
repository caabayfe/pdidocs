addAllErrorsFromStepToIgnoredList();
function addAllErrorsFromStepToIgnoredList() {
	action.setRedirectURL(current);

	//get the client errors for this step
	var clientErrorsGR = new GlideRecord("sys_atf_test_result_item");
	clientErrorsGR.addQuery("test_result", current.test_result);
	clientErrorsGR.addQuery("step", current.step);
	clientErrorsGR.addQuery("type", "client_error");
	clientErrorsGR.query();

	if (clientErrorsGR.getRowCount() == 0) {
		gs.addInfoMessage(gs.getMessage("The step result for the '{0}' step does not have any errors", current.step.sys_name), "ATF_No_Client_Errors");
		return false;
	}

	while (clientErrorsGR.next()) {
		// if the error has a sys_atf_whitelist (Allowed Client Error) record, update it
		var whitelistedClientErrorSysId = new WhitelistedClientErrorUtil().getWhitelistedClientErrorSysId(clientErrorsGR);

		if (whitelistedClientErrorSysId != null) {
			// get sys_atf_whitelist error record
			var existingRecord = new GlideRecord('sys_atf_whitelist');
			existingRecord.get(whitelistedClientErrorSysId);

			// set active to true and report level to ignore
			existingRecord.active = true;
			existingRecord.report_level = 'ignored';
			existingRecord.description = clientErrorsGR.description;
			existingRecord.test = current.test_result.test;
			existingRecord.update();
		} else {
			// add an entry for this error since it has not been added
			var gr = new GlideRecord('sys_atf_whitelist');
			gr.initialize();
			gr.error_message = clientErrorsGR.output;
			gr.report_level = 'ignored';
			gr.active = true;
			gr.description = clientErrorsGR.description;
			gr.test = current.test_result.test;
			gr.insert();
			whitelistedClientErrorSysId = gr.getUniqueValue();
		}

		// set the test log's whitelisted_client_error (Allowed client error) error field if not populated
		if (!clientErrorsGR.getValue("whitelisted_client_error")) {
			clientErrorsGR.setValue("whitelisted_client_error", whitelistedClientErrorSysId);
			clientErrorsGR.update();
		}
	}

	gs.addInfoMessage(gs.getMessage("All the client errors in the '{0}' step have been added to {1}the ignored list{2}", [current.step.sys_name, "<a href='/sys_atf_whitelist_list.do?sysparm_query=active=true^test=" + current.test_result.test + "'>", "</a>"]));
}
