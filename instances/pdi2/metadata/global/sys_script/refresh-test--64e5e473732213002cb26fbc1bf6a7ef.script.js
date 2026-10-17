(function executeRule(current, previous /*null when async*/) {

  new sn_atf.TestSuiteProcessor().refreshTest(current.getValue("sys_id"));

})(current, previous);
