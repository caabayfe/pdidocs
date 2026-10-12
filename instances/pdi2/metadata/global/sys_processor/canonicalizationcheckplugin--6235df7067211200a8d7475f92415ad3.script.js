(function process(g_request, g_response, g_processor) {

	if(pm.isActive("com.snc.field_normalization"))
		g_response.sendRedirect("canon_plugin_warning.do");
	else
		g_response.sendRedirect('now/app-manager/home/plugin/id/com.glide.data_services_canonicalization.client');

})(g_request, g_response, g_processor);
