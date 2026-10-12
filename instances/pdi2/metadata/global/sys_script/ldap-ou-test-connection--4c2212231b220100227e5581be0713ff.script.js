if ("1" == gs.getSession().getProperty("dotest") ) {
    g_scratchpad.dotest="1"; 
	gs.getSession().clearProperty("dotest");
}
