(function process(g_request, g_response, g_processor) {

	// Branch based on command
	if(g_request.getParameter('command') == 'rca_list') {
		var api = new SNC.ServiceAnalyticsProcessor();
		g_processor.writeOutput(api.getQueryResult(g_request.getParameter('service_id')));
	} else {
		g_processor.writeOutput('{ "error": "Unknown command"}');
	}

})(g_request, g_response, g_processor);
