function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var metricTypeId = newValue;				
	if (metricTypeId == '') {
		g_form.setMandatory('assessment_record_field', false);
		g_form.setVisible('assessment_record_field', false);
		return;
	}
	
	var gr = new GlideRecord('asmt_metric_type');
	gr.get(newValue);
	if (gr.evaluation_method != 'assessment') {
		g_form.setMandatory('assessment_record_field', false);
		g_form.setVisible('assessment_record_field', false);
		return;
	}
	
	g_form.setVisible('assessment_record_field', true);
	g_form.setMandatory('assessment_record_field', true);
	
	var table = g_form.getValue('table');
	if (table == '')
		return;
	
	g_form.clearOptions('assessment_record_field');
	
	var onResponse = function(serverResponse) {
		var fields = serverResponse.responseXML.getElementsByTagName('field');
		var numFields = fields.length;

		for(var i = 0; i < numFields; i++) {
			var label = fields[i].getAttribute('label');
			var name = fields[i].getAttribute('name');
			g_form.addOption('assessment_record_field', name, label);
			if (fields[i].getAttribute('value') == 'true')
				g_form.setValue('assessment_record_field', name, label);
		}
	};
	
	var ga = new GlideAjax('AssessmentUtilsAJAX');
	ga.addParam('sysparm_name', 'getCompatibleFields');
	ga.addParam('sysparm_id', g_form.getUniqueValue());
	ga.addParam('sysparm_table', table);
	ga.addParam('sysparm_metric_type', metricTypeId);
	ga.getXML(onResponse);
}
