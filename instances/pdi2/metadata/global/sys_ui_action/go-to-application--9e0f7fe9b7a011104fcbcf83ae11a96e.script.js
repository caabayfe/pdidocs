function redirect() {
	var w = getTopWindow();
	var baseUrl = w.location.href.substring(0, w.location.href.lastIndexOf('/'));
	var applicationPageUrl = baseUrl + '/$allappsmgmt.do%3Fsysparm_search=' + g_form.getDisplayBox('upgrade_plan_item').value;
	w.open(applicationPageUrl);
}
