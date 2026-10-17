function buildAnalyticsRedirectURL() {
	var url = new GlideURL('$pa_dashboard.do');
	url.addParam('dashboard','3001aa169f011200ef4afa7dc67fcf7f');
	url.addParam('breakdown_source','de126e169f011200ef4afa7dc67fcf5e');
	url.addParam('element', g_scratchpad.service_name + '.do');
	return url;
}

function openAnalyticsWindow() {
	var url = buildAnalyticsRedirectURL();
	var w = getTopWindow();
	var newWindow = w.open(url.getURL(), "_blank");
	newWindow.focus();
}
