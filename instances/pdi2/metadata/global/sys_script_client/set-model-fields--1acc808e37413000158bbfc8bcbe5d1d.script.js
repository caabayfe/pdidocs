function onLoad() {
	var modelSysId = g_form.getValue('model');
    if (modelSysId != '') {
		if (g_form.getValue('description') == '' || g_form.isNewRecord()) {
			var ajax = new GlideAjax("AssetUtilsAJAX");
			var fields = [];
			ajax.addParam("sysparm_name", "getModelValues");
			ajax.addParam("sysparm_sysId", modelSysId);
			if (g_form.getValue('description') == '') {
				fields.push('description');
			}
			if (g_form.isNewRecord()) {
				fields.push('cost');
			}
			ajax.addParam("sysparm_fields", fields);
			ajax.getXML(readResponse);
		}
    }
}
function readResponse(response) {
    var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
	if (g_form.getValue('description') == '') {
		g_form.setValue('description', result.description);
	}
	if (g_form.isNewRecord()) {
		g_form.setValue('price', result.currency + ';' + result.value);
		g_form.setValue('price.display', result.value);
    }
}
