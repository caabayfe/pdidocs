(function process(g_request, g_response, g_processor) {
	
	var userGr = new GlideRecord("sys_user");
	userGr.addQuery("user_name","guest");
	userGr.query();
	var userId = userGr.next() ? userGr.sys_id+"" : "guest"; 
	var kbsList = new KBDiagnostics().getDiagnosticsForUnauthenticatedUser(userId);
	if(kbsList.length>0)
		gs.addInfoMessage(gs.getMessage("These knowledge bases are accessible to unauthenticated users. To change the access permissions for a knowledge base, configure its user criteria settings. <a href='/api/now/v1/context_doc_url/CSHelp:UserCriteria-KB' target='_blank'>More information</a>."));
	else
		gs.addInfoMessage(gs.getMessage("No knowledge bases are accessible to unauthenticated users."));
	var gr = new GlideRecord("kb_knowledge_base");
	gr.addQuery("sys_id", "IN", kbsList);
    var query = gr.getEncodedQuery();
	g_response.sendRedirect("/kb_knowledge_base_list.do?sysparm_fixed_query="+query);

})(g_request, g_response, g_processor);
