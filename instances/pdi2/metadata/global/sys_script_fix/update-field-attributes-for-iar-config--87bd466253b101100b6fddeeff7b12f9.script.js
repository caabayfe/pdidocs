makeTemplatesNonMandatory();
makeTemplatesRefQualsScripted();
makeNotificationUserFieldMandatory();
renameColumnLabel(AutoResolutionConstants.CONFIG_TABLE_NAME, "notification_user", "Notification user", "Requester");
updateTableAccess(AutoResolutionConstants.CONFIG_TABLE_NAME);

function makeTemplatesNonMandatory() {
	var templateNames = ["task_resolution_template", "topic_completion_template", "unresolved_task_template"];
	templateNames.forEach(function (templateName) {
		var dictionaryGr = new GlideRecord("sys_dictionary");
		dictionaryGr.addQuery("name", AutoResolutionConstants.CONFIG_TABLE_NAME);
		dictionaryGr.addQuery("element", templateName);
		dictionaryGr.query();
		
		if (dictionaryGr.next() && dictionaryGr.mandatory) {
			dictionaryGr.mandatory = false;
			dictionaryGr.update();
			gs.info('Executing IAR Fix Script: Successfully updated mandatory dictionary field for {0} element to false.', templateName);
		}
	});
}

function makeTemplatesRefQualsScripted() {
	var templateNames = ["task_assignment_template", "task_resolution_template", "topic_completion_template", "unresolved_task_template"];
	templateNames.forEach(function (templateName) {
		var dictionaryGr = new GlideRecord("sys_dictionary");
		dictionaryGr.addQuery("name", AutoResolutionConstants.CONFIG_TABLE_NAME);
		dictionaryGr.addQuery("element", templateName);
		dictionaryGr.query();

		if (dictionaryGr.next()) {
			dictionaryGr.reference_qual = 'javascript:new AutoResolutionRefQualifier().getTemplates(current.target_table_name)';
			dictionaryGr.update();
			gs.info('Executing IAR Fix Script: Successfully updated reference qualifier dictionary field for {0} element to scripted method.', templateName);
		}
	});
}

function makeNotificationUserFieldMandatory() {
	var elementName = "notification_user";
	var dictionaryGr = new GlideRecord("sys_dictionary");
	dictionaryGr.addQuery("name", AutoResolutionConstants.CONFIG_TABLE_NAME);
	dictionaryGr.addQuery("element", elementName);
	dictionaryGr.query();
		
	if (dictionaryGr.next() && !dictionaryGr.mandatory) {
		dictionaryGr.mandatory = true;
		dictionaryGr.update();
		gs.info('Executing IAR Fix Script: Successfully updated mandatory dictionary field for {0} element to true.', elementName);
	}

}

function renameColumnLabel(tableName, columnName, existingLabel, replaceWith) {
	var sysDictionaryGr = new GlideRecord('sys_dictionary');
	sysDictionaryGr.addQuery('name', tableName);
	sysDictionaryGr.addQuery('element', columnName);
	sysDictionaryGr.addQuery('column_label', existingLabel);
	sysDictionaryGr.query();
	
	if (sysDictionaryGr.next()) {
		sysDictionaryGr.setValue('column_label', replaceWith);
		sysDictionaryGr.update();
		
		gs.info('Executing IAR Fix script: Replaced the label of column {0} from {1} with {2} on the table {3}', columnName, existingLabel, replaceWith, tableName);
	} 
}

function updateTableAccess(tableName) {
	var tableRec = new GlideRecord('sys_db_object');
	tableRec.addQuery('name', tableName); 
	tableRec.query();
	
	if (tableRec.next()) {
		tableRec.setValue("create_access", true);
		tableRec.setValue("update_access", true);
		tableRec.update();
	}
}
