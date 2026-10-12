executeFix();

function executeFix() {
	var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
	configGr.addNotNullQuery(AutoResolutionConstants.CONFIGURATION_TABLENAME_FIELD_NAME);
	configGr.query();

	var shouldUpdate = false;
	
	while (configGr.next()) {

		var fieldNameValueArr = [];

		var fieldNameValueMap = {};
		fieldNameValueMap[AutoResolutionConstants.IAR_INVOCATION_FIELD_NAME] = AutoResolutionConstants.IAR_INVOCATION_BUSINESS_RULE;
		fieldNameValueArr.push(fieldNameValueMap);

		fieldNameValueMap = {};
		fieldNameValueMap[AutoResolutionConstants.IAR_PREDICTION_TABLE_FIELD_NAME] = AutoResolutionConstants.PREDICTION_TABLE_NAME;
		fieldNameValueArr.push(fieldNameValueMap);

		fieldNameValueMap = {};
		fieldNameValueMap["use_sla"] = false;
		fieldNameValueArr.push(fieldNameValueMap);
		
		shouldUpdate = AutoResolutionFixScriptUtil.updateFieldValue(fieldNameValueArr, configGr);

		if (shouldUpdate)
			configGr.update();
		
		AutoResolutionFixScriptUtil.addResponseChannelsWithActiveChatbot(configGr);
	}
}
