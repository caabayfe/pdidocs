if ("1" == gs.getSession().getProperty("dotest") || "0" == gs.getSession().getProperty("dotest")) {
    g_scratchpad.dotest = gs.getSession().getProperty("dotest");
	gs.getSession().clearProperty("dotest");
}
if (GlideStringUtil.notNil(current.mid_server)) 
	g_scratchpad.use_mid_server = "1";
else 
	g_scratchpad.use_mid_server = "0";

if (current.active)
	g_scratchpad.isActive = "1";
else 
	g_scratchpad.isActive = "0";
