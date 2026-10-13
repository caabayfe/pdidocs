(function(context, pageParams, blockcontext){
	var configSettingsKey = 'timeline_settings';
	var status = false;
	
	var settings = blockcontext.timelineSettings;

	var input = {
		configSettingsKey: configSettingsKey,
		configuration: settings
	};

	// return some_output
	var response = new SOWAdminConfigUtils().updateConfigurationData(input);

	if (response.statusCode === 200)
		status = true;
	
	return {
		updateStatus: status
	};

})(context, pageParams, blockcontext);
