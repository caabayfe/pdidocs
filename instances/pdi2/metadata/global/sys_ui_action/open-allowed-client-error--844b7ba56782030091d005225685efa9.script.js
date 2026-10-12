openWhitelistedClientErrorRecord();
function openWhitelistedClientErrorRecord() {
	// return to the test result form if clicking the ui action from there
	var tableName = RP.getParameterValue('sys_target');
	if (RP.isRelatedList() || (RP.toString().indexOf("item") == -1))
		action.setReturnURL(current.test_result.getRefRecord());
	else {
		// return to the list of test logs with the current filter if clicking the ui action from there
		var currentFilter = RP.getParameterValue('sysparm_query');
		action.setReturnURL(tableName + '_list.do?sysparm_query=' + currentFilter);
	}

	// show error message if test log is not a client error with a valid status
 	if (current.type != 'client_error') {
 		gs.addInfoMessage(gs.getMessage("Unable to find allowed client error"), "ATF_Whitelisted_Record_Not_Found");
 		return false;
 	}

	// if already present report form info, already exists
	var whitelistedClientErrorSysId = new WhitelistedClientErrorUtil().getWhitelistedClientErrorSysId(current);
	if (null != whitelistedClientErrorSysId) {
		var url = "sys_atf_whitelist.do";
		url += "?sysparm_query=sys_id=" + whitelistedClientErrorSysId;
		action.setRedirectURL(url);
		return;
	}
	gs.addInfoMessage(gs.getMessage("Unable to find allowed client error"), "ATF_Whitelisted_Record_Not_Found");
}
