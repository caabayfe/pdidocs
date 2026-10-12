(function executeRule(current, previous /*null when async*/) {
	var arrayUtil = new ArrayUtil();
	var templateFieldNamesList = arrayUtil.concat(AutoResolutionConstants.CONFIG_EMAIL_TEMPLATE_FIELD_NAMES, 
		AutoResolutionConstants.CONFIG_SMS_TEMPLATE_FIELD_NAMES);
	
	for (var i = 0; i < templateFieldNamesList.length; i += 1) {
		var fieldName = templateFieldNamesList[i];
		if (!current.isValidField(fieldName))
			continue;
		
		var templateElement = current.getElement(fieldName);
		var templateGr = templateElement.getRefRecord();
		if (gs.nil(templateGr))
			continue;

		var templateTable = templateGr.getTableName();

		var templateTargetTableFieldName;
		if (templateTable === AutoResolutionConstants.EMAIL_TEMPLATE_TABLE) {
			templateTargetTableFieldName = "collection";
		} else if (templateTable === AutoResolutionConstants.SMS_TEMPLATE_TABLE) {
			templateTargetTableFieldName = "table";
		}
		
		var configTargetTableName = current.getValue(AutoResolutionConstants.CONFIGURATION_TABLENAME_FIELD_NAME);
		var templateTargetTableName = templateGr.getValue(templateTargetTableFieldName);
		if (!gs.nil(templateTargetTableName) && templateTargetTableName !== configTargetTableName) {
			gs.addErrorMessage(
				gs.getMessage("The target table for auto resolution must match the table for the notification template specified in the {0} field.", 
				templateElement.getLabel()));
			current.setAbortAction(true);
			return;
		}
	}
	
})(current, previous);
