function onShowAllDomainProcesses() {	
	var url = new GlideURL();
	url.initialize(window.location.href);
	if (! url.getParam('sysparm_query_no_domain'))
		url.addParam('sysparm_query_no_domain', 'true');
	url.setEncode(false);
	g_navigation.open(url.getURL());
}
