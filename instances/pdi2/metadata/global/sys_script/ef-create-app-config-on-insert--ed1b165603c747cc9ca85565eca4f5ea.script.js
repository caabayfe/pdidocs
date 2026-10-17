(function executeRule(current, previous) {
	const logger = EFLogger.forClass('EFCreateAppConfigOnInsert');
	const sourceAppSysId = current.getUniqueValue();
	
	try {
		const grConfig = new GlideRecord(EFConstants.TABLES.ERROR_CONFIG);
		grConfig.initialize();
		grConfig.setValue(EFConstants.ERROR_CONFIG_FIELDS.SOURCE_APPLICATION, sourceAppSysId);
		grConfig.insert();
	} catch (error) {
		logger.error(sn_i18n.Message.getMessage('error_framework', 'EFCreateAppConfigOnInsert: Failed to create default error config for source application {sourceApp}: {errorMessage}', {sourceApp: sourceAppSysId, errorMessage: error.message}));
	}
})(current, previous);
