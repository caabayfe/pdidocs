function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if ( newValue == '') {
	    hideDependsOn();
        return;
   }


	if('assessment' == g_form.getValue('method')) {
      showDependsOnByDataType(newValue);	
	}
}

function hideDependsOn() {
	setField('displayed_when', false);
	setField('displayed_when_yesno', false);
	setField('displayed_when_checkbox', false);
	setField('displayed_when_template', false);
}	

function showDependsOnByDataType(newValue) {
	var dependsOnTypeGR = new GlideRecord('asmt_metric');
	dependsOnTypeGR.get(newValue);

	var dependsOnType = dependsOnTypeGR.datatype;

	setField('displayed_when', (dependsOnType == 'choice' || dependsOnType == 'scale' || dependsOnType == 'numericscale' || dependsOnType == 'imagescale' || dependsOnType == 'multiplecheckbox'));
	setField('displayed_when_yesno', (dependsOnType == 'boolean'));
	setField('displayed_when_checkbox', (dependsOnType == 'checkbox'));
	setField('displayed_when_template', (dependsOnType == 'template'));
}

function setField(field, state) {
	g_form.setMandatory(field, state);
	g_form.setDisplay(field, state);
}
