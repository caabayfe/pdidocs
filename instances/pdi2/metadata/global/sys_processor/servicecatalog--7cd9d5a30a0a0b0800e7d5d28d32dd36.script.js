executeProcessor();

function executeProcessor() {
	if (!g_processor.canRunAction())
		return;
	
	try {
		var valves =  new GlideappValveProcessor();
		if (valves.beforeProcessor(g_request, g_response, g_processor))
			return;
		
		var a = new ServiceCatalogProcessor(g_request, g_response, g_processor);
		a.process();
	} catch(e) {
		var catalogExceptionUtils = new CatalogExceptionUtils();
		if(catalogExceptionUtils.isValveException(e)) {
			var redirectUrl = catalogExceptionUtils.handleValveException(e);
			g_response.sendRedirect(redirectUrl);
		}
	}
}
