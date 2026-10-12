function showFlowContext () {
	var url = new GlideURL('catalog_flow_context.do');
	url.addParam('sysparm_sys_id', g_form.getUniqueValue());
	url.addParam('sysparm_ck', g_form.getValue("sysparm_ck"));
	g_navigation.open(url.getURL(), "_blank");
}
