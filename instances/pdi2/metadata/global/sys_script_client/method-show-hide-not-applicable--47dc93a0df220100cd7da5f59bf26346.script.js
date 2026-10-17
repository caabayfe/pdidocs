function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(newValue != 'assessment') {
		setField('displayed_when', false);
		setField('displayed_when_yesno', false);
		setField('displayed_when_checkbox', false);
		setField('displayed_when_template', false);
	}
	
	if(newValue == 'assessment' ) {
		var dependsOnTypeGR = new GlideRecord('asmt_metric');
		dependsOnTypeGR.get(g_form.getValue("depends_on"));
	
		var dependsOnType = dependsOnTypeGR.datatype;
	
		setField('displayed_when', (dependsOnType == 'choice' || dependsOnType == 'scale' || dependsOnType == 'numericscale' || dependsOnType == 'imagescale' || dependsOnType == 'multiplecheckbox'));
		setField('displayed_when_yesno', (dependsOnType == 'boolean'));
		setField('displayed_when_checkbox', (dependsOnType == 'checkbox'));
		setField('displayed_when_template', (dependsOnType == 'template'));
	}
	
	if (newValue == 'script') {
		g_form.setValue('allow_not_applicable', false);
		g_form.setVisible('allow_not_applicable', false);
		g_form.setValue('mandatory', false);
		g_form.setVisible('mandatory', false);
	}
	else {
		var datatype = g_form.getValue('datatype');
		
		g_form.setVisible('mandatory', true);
		if (datatype != 'percentage' && datatype != 'string' && datatype != 'date' && datatype != 'datetime' && datatype != 'checkbox' && datatype != 'long' && datatype != 'attachment' && datatype != 'imagescale' && datatype != 'multiplecheckbox' && datatype != 'ranking')
			g_form.setVisible('allow_not_applicable', true);	
		else{
			g_form.setValue('allow_not_applicable', false);
			g_form.setVisible('allow_not_applicable', false);
		}
	}
}

function setField(field, state) {
	g_form.setMandatory(field, state);
	g_form.setDisplay(field, state);
}
