(function executeRule(current, previous /*null when async*/) {

	new sn_atf.TestSuiteProcessor().refreshTestSuite(current.getValue("sys_id"), false);

})(current, previous);
