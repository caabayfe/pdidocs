function updateFieldLabel(tableName, fieldName, oldLabel, newLabel) {
	var path = tableName + '.' + fieldName;
	var gr = new GlideRecord('sys_dictionary');
	gs.log('Attempting change of label for ' + path + ' from ' + oldLabel + ' to ' + newLabel);
	gr.addQuery('name', tableName);
	gr.addQuery('element', fieldName);
	gr.query();
	if (gr.next()) {
		var currentLabel = gr.getValue('column_label');
		if (currentLabel != oldLabel) {
			gs.log('Skipping label change, expected ' + oldLabel + ' but found ' + currentLabel);
			return;
		}
		gr.setValue('column_label', newLabel);
		gr.update();
		gs.log('Changed label of ' + path + ' to ' + newLabel);
	} else {
		gs.log('Record ' + path + ' not found in sys_dictionary. Skipping...');
	}
}

//This function updates doc label for table (element=NULL)
function updateDocLabels(tableName, oldLabel, newLabel, oldPlural, newPlural) {
	var gr = new GlideRecord('sys_documentation');
	gs.log('Attempting change of table label for ' + tableName + ' from ' + oldLabel + ' to ' + newLabel);
	gr.addQuery('language', 'en');
	gr.addQuery('name', tableName);
	gr.addQuery('element', 'NULL');
	gr.query();
	if (gr.next()) {
		var wasModified = false;
		var currentLabel = gr.getValue('label');
		if (currentLabel == oldLabel) {
			gr.setValue('label', newLabel);
			wasModified = true;
		} else {
			gs.log('Skipping singular label change in sys_documentation, expected ' + oldLabel + ' but found ' + currentLabel);
		}

		currentLabel = gr.getValue('plural');
		if (currentLabel == oldPlural) {
			gr.setValue('plural', newPlural);
			wasModified = true;
		} else {
			gs.log('Skipping plural label change in sys_documentation, expected ' + oldPlural + ' but found ' + currentLabel);
		}
		
		if (wasModified) {
			gr.update();
			gs.log('Updated sys_documentation record for ' + tableName + ' to ' + [newLabel, newPlural]);
		}
	} else {
		gs.log('Record for ' + tableName + ' not found in sys_documentation. Skipping...');
	}
}

updateDocLabels('sa_service_group_member', 'Business Service Group Members', 'Application Service Group Member', 'Business Service Group Members', 'Application Service Group Members');
updateDocLabels('cmdb_ci_service_group',  'Business Service Group', 'Application Service Group', 'Business Service Groups', 'Application Service Groups');

updateFieldLabel('sa_service_group_member', 'service', 'Business Service', 'Application Service');
updateFieldLabel('sa_service_group_member', 'service_group', 'Business Service Group', 'Application Service Group');
