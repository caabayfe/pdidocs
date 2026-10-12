(function executeRule(current, previous /*null when async*/) {
	var utProcessor = new sn_atf.UserTestProcessor();
	var testResultId = utProcessor.getFirstScheduledOrRunningTestResultSysIdForTest(current.test);
	if (testResultId) {
	  var link = "href='/sys_atf_test_result.do?sys_id=" + testResultId + "'";
	  var message = "This test is currently running or is scheduled to run soon. Modifying the test or its steps while the test is running could cause the test run to fail. <a {0}>See the state of the test run here</a>";
	  gs.addInfoMessage(gs.getMessage(message, link));
	}
})(current, previous);
