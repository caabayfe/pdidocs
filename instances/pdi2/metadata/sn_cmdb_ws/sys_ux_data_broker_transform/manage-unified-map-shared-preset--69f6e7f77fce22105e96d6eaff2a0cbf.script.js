function transform(input) {
	var result = {
		alerts: {
			info: [],
			error: []
		}
	};
	var appId = input.appId;
	if(gs.nil(appId)) {
		return result;
	}

	try {
		var umSharedPresetUtils = new sn_cmdb_ws.UnifiedMapSharedPresetUtils();
		var response = umSharedPresetUtils.processPresetChange(input);
		return response;
	} catch (error) {
		result.alerts.error.push(error.toString());
	}
	
	return result;
}
