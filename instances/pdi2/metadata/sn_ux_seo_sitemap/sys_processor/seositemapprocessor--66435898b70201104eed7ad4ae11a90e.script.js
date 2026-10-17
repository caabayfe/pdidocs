(function process(g_request, g_response, g_processor) {

	// get the url parameters
	var sitemapConfigId = g_request.getParameter("sitemapConfigId");
	var pageNo = g_request.getParameter("pageNo");
	
	// instantiate SitemapRetriever to fetch generated sitemap content
	var sitemapRetriever = new sn_ux_seo_sitemap.SitemapRetriever();
	var xml = sitemapRetriever.getSitemapXML(sitemapConfigId, pageNo);
	g_response.setHeader("content-type", "application/xml");
	g_processor.writeOutput(xml);

})(g_request, g_response, g_processor);
