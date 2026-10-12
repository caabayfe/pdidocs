function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	var datatype = g_form.getValue("datatype");
	if (datatype == "template") {
		var template = g_form.getReference("template");
		
		var ga = new GlideAjax('AssessmentUtilsAJAX');
		ga.addParam('sysparm_name', 'getTemplateMinMax');
		ga.addParam('sysparm_template', template.sys_id);
		ga.getXML(ajaxResponse);
	}
}

function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	g_form.setValue('min', result[0].getAttribute("min"));
	g_form.setValue('max', result[0].getAttribute("max"));
}
