function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || newValue === oldValue)
      return;

	var missingRequiredFields = g_form.getMissingFields();
	if(missingRequiredFields.length === 0) {
		populateRelatedLists();
		g_form.save();
	} else {
		if(missingRequiredFields.indexOf('name') > -1)
			getMessage('Please add name field', function(msg) {
				g_form.addErrorMessage(msg);
			});
		g_form.setValue('data_class', '');
	}
}

function populateRelatedLists() {
	var classifiedFieldGA = new GlideAjax('RTBIUtilAjax');
	classifiedFieldGA.addParam('sysparm_name', 'populateFields');
	classifiedFieldGA.addParam('sysparm_rtbiConfigId', g_form.getUniqueValue());
	classifiedFieldGA.addParam('sysparm_dataClassId', g_form.getValue('data_class'));
	classifiedFieldGA.getXML();

	var primaryReferenceLinkGA = new GlideAjax('RTBIUtilAjax');
	primaryReferenceLinkGA.addParam('sysparm_name', 'populateLinks');
	primaryReferenceLinkGA.addParam('sysparm_rtbiConfigId', g_form.getUniqueValue());
	primaryReferenceLinkGA.addParam('sysparm_dataClassId', g_form.getValue('data_class'));
	primaryReferenceLinkGA.addParam('sysparm_primaryTableName', 'sys_user');
	primaryReferenceLinkGA.getXML();
}
