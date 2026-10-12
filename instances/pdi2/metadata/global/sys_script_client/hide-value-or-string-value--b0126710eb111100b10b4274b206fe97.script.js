function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '')
    	return;

	var metric = new GlideRecord('asmt_metric');
	if (metric.get(newValue)) {
		var datatype = metric.datatype;
	   
		if (datatype == 'attachment') {
			// hide both string value and value fields
			g_form.setDisplay('value', false);
			g_form.setDisplay('string_value', false);
		}
		else if (datatype == 'date' || datatype == 'datetime' || datatype == 'string') {
			g_form.setDisplay('value', false); 		// hide value field
			g_form.setDisplay('string_value', true);
		}
		else {
    		g_form.setDisplay('string_value', false);  // hide String value field
			g_form.setDisplay('value', true);
		}
	}
}
