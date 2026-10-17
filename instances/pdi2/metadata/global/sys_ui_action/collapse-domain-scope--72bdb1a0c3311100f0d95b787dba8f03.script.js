function onShowGlobalDomainProcesses() {
	var url = new GlideURL();
	url.initialize(window.location.href);
	if (url.getParam('sysparm_query_no_domain'))
		url.deleteParam('sysparm_query_no_domain');
	url.setEncode(false);
	g_navigation.open(url.getURL());
}
