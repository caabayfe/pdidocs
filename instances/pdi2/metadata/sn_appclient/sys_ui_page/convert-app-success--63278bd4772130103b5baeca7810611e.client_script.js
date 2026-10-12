function onGoToMyCompanyApp() {
	var url = new GlideURL('$mycompanyappsmgmt.do?sysparm_search=' + g_form.getValue('name'));
	window.location.href = url.getURL();
}

$('sn_appclient_convert_app_success_closemodal').observe('click', function (event) {
	var url = new GlideURL('sys_app_list.do');
	window.location.href = url.getURL();
});
