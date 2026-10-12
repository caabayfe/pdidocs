(function executeRule(current, previous /*null when async*/) {
	if ("1" == gs.getSession().getProperty("do_test_export_target_connection") ) {
		g_scratchpad.do_test_export_target_connection = "1";
		gs.getSession().clearProperty("do_test_export_target_connection");
	}
})(current, previous);
