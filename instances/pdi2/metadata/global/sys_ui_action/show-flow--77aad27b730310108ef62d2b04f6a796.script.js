function showFlowContext () {
	var url;
	if (g_scratchpad.flowData.hasMultipleFlows === false && g_scratchpad.flowData.flowId !== "") {
		url = new GlideURL("/$flow-designer.do#/operations/context/" + g_scratchpad.flowData.flowId);
	} else {
		url = new GlideURL("sys_flow_context_list.do");
		url.addParam("sysparm_fixed_query", g_scratchpad.flowData.flowQuery);
	}

	g_navigation.open(url.getURL(), "_blank");
}
