(function process(g_request, g_response, g_processor) {

	var sys_id = g_request.getParameter('sysparm_sys_id');
	var flow_context_id = "";
	var gr = new GlideRecord("sc_req_item");
	gr.addQuery("sys_id", sys_id);
	gr.query();
	if (gr.next()) {
		flow_context_id = gr.getValue("flow_context");
	}
	var gu = new GlideURL('/$flow-designer.do#/operations/context/' + flow_context_id);
	g_response.sendRedirect(gu.toString());

})(g_request, g_response, g_processor);
