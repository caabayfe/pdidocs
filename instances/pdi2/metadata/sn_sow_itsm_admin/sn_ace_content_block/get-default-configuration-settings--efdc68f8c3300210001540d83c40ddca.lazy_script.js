
(function(context, pageParams, blockcontext){
	var rawSettings = '{"dateFormat":"yyyy-MM-dd","timeFormat":"HH:mm:ss","timeZone":"US/Central","orderOfEvents":"asc","eventGrouping":{"enabled":true,"groupByValue":5,"groupBy":"Mins","eventGroupingInSeconds":300},"eventSources":{"milestones":true,"activityStream":true}}';
	var configSettingsKey = 'timeline_settings';

	var settings = JSON.parse(rawSettings);

	// return some_output
	var response = new sn_sow_itsm_admin.SOWAdminConfigUtils().retrieveConfigurationData(configSettingsKey);
	
	if ((response.statusCode === 200) && !gs.nil(response.data))
		settings = response.data;
	
	return {
		settings: settings
	};

})(context, pageParams, blockcontext);
