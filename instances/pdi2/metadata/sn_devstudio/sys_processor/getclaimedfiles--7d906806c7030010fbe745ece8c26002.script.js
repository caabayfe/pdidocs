(function process(g_request, g_response, g_processor) {
	
	var appSysId = g_request.getParameter("sysparm_sys_id");
	var count = sn_gfiles.ClaimAPI.getNumberOfStolenFilesForApp(appSysId);
	g_processor.writeOutput(count);

})(g_request, g_response, g_processor);
