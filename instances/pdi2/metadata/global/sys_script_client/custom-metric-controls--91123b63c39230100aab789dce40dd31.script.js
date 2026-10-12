function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(isLoading || newValue == '' || newValue != 'custom')
		return;
    var customMetric = g_form.getReference("custom_metric");
    if(!customMetric || !customMetric.sys_id)
		return;
    var ga = new GlideAjax('AssessmentUtilsAJAX');
    ga.addParam('sysparm_name', 'getCustomMetricDatatype');
    ga.addParam('sysparm_custom_metric', customMetric.sys_id);
    ga.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
    var result = serverResponse.responseXML.getElementsByTagName("result");
	if(!result)
		return;
    var datatype = result[0].getAttribute("datatype");
    showHideFields(datatype);
}

function showHideFields(datatype) {
   	var isNumber = datatype == 'number';
    var isScored = g_form.getValue("scored") == "true";
    g_form.setMandatory("correct_answer", isNumber && isScored);
    g_form.setDisplay("correct_answer", isNumber && isScored);
    g_form.setDisplay("scored", isNumber || isScored);
    g_form.setDisplay("weight", isNumber);
    g_form.setDisplay("scale", (isNumber && !isScored));
    g_form.setDisplay("min", isNumber);
    g_form.setDisplay("max", isNumber);
    g_form.setDisplay("allow_add_info", isNumber);
	g_form.setDisplay("allow_sentiment_analysis", !isNumber);
}
