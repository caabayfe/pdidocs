var AutoResolutionFixScriptUtil = Class.create();

AutoResolutionFixScriptUtil.addResponseChannelsWithActiveChatbot = function(configGr) {
	
	var responseChannel = gs.getProperty(AutoResolutionConstants.RESPONSE_CHANNEL_LIST, '');
	var responseChannelList = responseChannel.split(",");
	if (!responseChannelList.length)
		return;

	var responseChannelGa = new GlideAggregate(AutoResolutionConstants.RESPONSE_CHANNEL_TABLE_NAME);
	responseChannelGa.addAggregate('COUNT');
	responseChannelGa.addQuery(AutoResolutionConstants.RESPONSE_CHANNEL_FIELD_NAME, "IN", responseChannelList);
	responseChannelGa.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, configGr.getUniqueValue());
	responseChannelGa.query();
	
	if (!responseChannelGa.hasNext() || (responseChannelGa.next() && parseInt(responseChannelGa.getAggregate('COUNT')) > 0))
		return;

	// Create response channels and set chatbot to active if no response channels exist for this config
	AutoResolutionResponseChannelHelper.createResponseChannelForARConfig(configGr.getUniqueValue());
	
	var responseChannelGr = new GlideRecord(AutoResolutionConstants.RESPONSE_CHANNEL_TABLE_NAME);
	responseChannelGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, configGr.getUniqueValue());
	responseChannelGr.addQuery(AutoResolutionConstants.RESPONSE_CHANNEL_FIELD_NAME, 
		AutoResolutionNotificationHelper.RESPONSE_CHANNEL.VA);
	responseChannelGr.query();

	if (!responseChannelGr.next())
		return;
	
	var fieldNameValueArr = [];
	var fieldNameValueMap = {};
	fieldNameValueMap["active"] = true;
	fieldNameValueArr.push(fieldNameValueMap);

	shouldUpdate = AutoResolutionFixScriptUtil.updateFieldValue(fieldNameValueArr, responseChannelGr);

	if (shouldUpdate)
		responseChannelGr.update();
	
};

AutoResolutionFixScriptUtil.updateFieldValue = function(fieldNameValueArr, gr) {

	var shouldUpdate = false;
	var tableName = gr.getClassDisplayValue(gr.getTableName());

	for (var i=0; i<fieldNameValueArr.length; i++) {
		var fieldNameValueMap = fieldNameValueArr[i];
		var fieldName = Object.keys(fieldNameValueMap)[0];
		var fieldValue = fieldNameValueMap[fieldName];

		if (gr.isValidField(fieldName)) {
			gr.setValue(fieldName, fieldValue);
			gs.info('Executing IAR Fix script: Successfully updated {0} field on {1}={2} to {3}',
				fieldName, tableName, gr.getUniqueValue(), fieldValue);
			shouldUpdate = true;
		}
	}
	return shouldUpdate;
};

AutoResolutionFixScriptUtil.prototype = {
    initialize: function() {
    },

    type: 'AutoResolutionFixScriptUtil'
};
