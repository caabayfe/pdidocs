setDefaultValues();

function setDefaultValues() {
    var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
    configGr.addQuery(AutoResolutionConstants.CONFIGURATION_TABLENAME_FIELD_NAME, AutoResolutionConstants.INCIDENT_TABLE_NAME);
    configGr.query();

	if (configGr.next()) {
		configGr.setValue('advanced','true');
		configGr.setValue(AutoResolutionConstants.IAR_PREDICTION_FIELDS_COLUMN_NAME,'short_description');
		configGr.setValue(AutoResolutionConstants.PRE_PROCESSING_EXT_POINT_FIELD_NAME,'a383f707eb39011054009861eb52281a');
		configGr.setValue(AutoResolutionConstants.POST_PROCESSING_EXT_POINT_FIELD_NAME,'87917be2ebf5011054009861eb5228a4');
		configGr.update();
	}
}
