function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue == '' || !g_form.isNewRecord())
      return;

    // set the table of the category equal to the table of the metric type
	var ajax = new GlideAjax('AssessmentUtilsAJAX');
	ajax.addParam('sysparm_metric_type', String(newValue));
	ajax.addParam('sysparm_name', 'getMetricTypeTable');
	ajax.getXML(function(response) {
		if (response) {
				var table = response.responseXML.documentElement.getAttribute('answer');
				g_form.setValue('table', table);
		}
	});		
}
