(function executeRule(current, previous /*undefined when async or display*/) {

	if ("1" == gs.getSession().getProperty("doexportdata") ) {
		g_scratchpad.doexportdata="1";
		gs.getSession().clearProperty("doexportdata");
	} else if ("1" == gs.getSession().getProperty("dotestexport20records") ) {
		g_scratchpad.dotestexport20records="1";
		gs.getSession().clearProperty("dotestexport20records");
	}

})(current, typeof previous != 'undefined' ?  previous : null);
