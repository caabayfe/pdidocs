executeFix();

function executeFix() {
	var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
	configGr.query();
	
	while (configGr.next()) {
		if (configGr.isValidField(AutoResolutionConstants.CONFIGURATION_ASSIGN_TO_FIELD_NAME)) {
			var vaUserId = new AutoResolutionContextHelper()._getVAUserID();
			configGr.setValue(AutoResolutionConstants.CONFIGURATION_ASSIGN_TO_FIELD_NAME, vaUserId);
			configGr.update();
			gs.info('Executing IAR Fix script: Successfully updated assign_to field on Issue Auto-Resolution configuration={0} to Virtual Agent user={1}', configGr.getUniqueValue(), vaUserId);
		}
	}
}
