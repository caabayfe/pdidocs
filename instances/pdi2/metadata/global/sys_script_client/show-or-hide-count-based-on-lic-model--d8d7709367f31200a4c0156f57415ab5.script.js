function onLoad() {
	
	var ga = new GlideAjax('UALicensingHelper');
	ga.addParam('sysparm_name','getLicenseModelByAppId');
	ga.addParam('sysparm_app_id', g_form.getValue('app_id'));
	ga.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
	var licenseModel = serverResponse.responseXML.documentElement.getAttribute('answer');
	
	if (licenseModel == "none" || licenseModel == "capacity") {
		g_form.setDisplay("fulfill_count", false);
		g_form.setDisplay("produce_count", false);
		
		return;
	}
		
	if (licenseModel == "fulfiller")
		g_form.setDisplay("produce_count", false);
	else if (licenseModel == "producer")
		g_form.setDisplay("fulfill_count", false);
}
