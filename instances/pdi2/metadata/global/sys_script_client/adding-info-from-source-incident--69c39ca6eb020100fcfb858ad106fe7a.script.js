function onChange(control, oldValue, newValue, isLoading, isTemplate) {

	if (isLoading || newValue == '')
		return;
	
	if ((g_form.getValue('short_description')=='')||(g_form.getValue('source_ci')=='')){
		g_form.getReference('source_incident', populate_SD_CI);
	}
	
	if (g_form.getValue('background')==''){
		var ga = new GlideAjax('IncidentAlertAjax');
		ga.addParam('sysparm_name','getSummary');
		ga.addParam('sysparm_source_inc',g_form.getValue('source_incident'));
		ga.getXMLAnswer(populateSummary);
	}
}

function populate_SD_CI(inc){
	if (g_form.getValue('short_description')=='')
		g_form.setValue('short_description',inc.short_description);
	if (g_form.getValue('source_ci')=='')
		g_form.setValue('source_ci',inc.cmdb_ci);
}

function populateSummary(answer) {
	g_form.setValue('background',answer);
}
