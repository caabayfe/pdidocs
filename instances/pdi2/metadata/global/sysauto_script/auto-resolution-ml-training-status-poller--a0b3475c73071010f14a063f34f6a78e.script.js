var configLangGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
configLangGr.addNotNullQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME);
configLangGr.addEncodedQuery(AutoResolutionConstants.AZ_ENCODED_QUERY);
configLangGr.query();

var configLanguagesCount = configLangGr.getRowCount();
var trainingCompletedCount = 0;

while (configLangGr.next()) {
	var mlHelper = AutoResolutionMLFactory.createMLHelper(configLangGr.getValue(AutoResolutionConstants.CONFIGURATION_FIELD_NAME));
		mlHelper.trainingJobStatusCheck();
		if (mlHelper.checkAllLanguageModelsTrainingCompleted()) 
			trainingCompletedCount++;

		if (trainingCompletedCount === configLanguagesCount)
			mlHelper.toggleScheduleJobActive(false);
}
