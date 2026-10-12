function redirect() {
	var w = getTopWindow();
	var baseUrl = w.location.href.substring(0, w.location.href.lastIndexOf('/'));
	var applicationPageUrl = baseUrl + '/$allappsmgmt.do?Fsysparm_search=' + g_form.getValue('name');
	w.open(applicationPageUrl);
}
