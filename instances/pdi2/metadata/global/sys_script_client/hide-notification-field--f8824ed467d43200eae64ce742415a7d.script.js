
g_form.setDisplay('notification', false);
function onLoad() {
	var ga = new GlideAjax("NotificationPreferenceUI");
	ga.addParam("sysparm_name", "enabled");
	ga.getXML(ajaxResponse);

	function ajaxResponse(serverResponse) {
		var result = serverResponse.responseXML.getElementsByTagName("xml")[0];
		var enabled = JSON.parse(result.getAttribute('answer'));
		g_form.setDisplay('notification', !enabled);
	}
}
