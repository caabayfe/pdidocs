function onChange(control, oldValue, newValue, isLoading, isTemplate) {		
	var metricTypeId = g_form.getValue('assessment');
	var table = newValue;	
	if (isLoading || table == '' || metricTypeId == '')
		return;
	
	g_form.clearOptions('assessment_record_field');
	
	var ga = new GlideAjax('AssessmentUtilsAJAX');
	
	var onResponse = function(serverResponse) {
		var fields = serverResponse.responseXML.getElementsByTagName('field');
		var numFields = fields.length;

		for (var i = 0; i < numFields; i++) {
			var label = fields[i].getAttribute('label');
			var name = fields[i].getAttribute('name');
			g_form.addOption('assessment_record_field', name, label);
			if (fields[i].getAttribute('value') == 'true')
				g_form.setValue('assessment_record_field', name, label);
		}
	};

	ga.addParam('sysparm_name', 'getCompatibleFields');
	ga.addParam('sysparm_id', g_form.getUniqueValue());
	ga.addParam('sysparm_table', table);
	ga.addParam('sysparm_metric_type', metricTypeId);
	ga.getXML(onResponse);
}
