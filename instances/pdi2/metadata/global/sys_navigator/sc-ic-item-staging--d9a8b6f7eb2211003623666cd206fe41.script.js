var isServiceCreatorItem = sc_ic_Factory.wrap(current).createdFromServiceCreator();
if (!isServiceCreatorItem)
	g_uri.set("sysparm_view", "sc_ic_item_staging_design");
else if (gs.hasRole("catalog_admin"))
	g_uri.set("sysparm_view", "service_admin");
else
	g_uri.set("sysparm_view", "service");

g_uri.set("sysparm_view_forced", "true");

answer = g_uri.toString(); 
answer;
