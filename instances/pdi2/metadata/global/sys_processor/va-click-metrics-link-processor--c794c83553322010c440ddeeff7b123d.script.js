(function process(g_request, g_response, g_processor) {

	var result = VAClickMetrics.processLink(g_request);
	
	if(!gs.nil(result.target_url)) 
		g_response.sendRedirect(result.target_url);
	else 
		// bad request. target URL should exist.
		g_response.setStatus(400);

})(g_request, g_response, g_processor);
