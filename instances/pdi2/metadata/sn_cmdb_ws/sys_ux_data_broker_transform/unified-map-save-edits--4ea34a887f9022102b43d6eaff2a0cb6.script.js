function transform(input) {
	var result = {
		info: [],
		error: []
	};
	var editHistoryEntry = input.editHistoryEntry;
	if(gs.nil(editHistoryEntry)) {
		return result;
	}
	var alerts;
	try {
		var umEditUtils = new sn_cmdb_ws.UnifiedMapEditUtils();
		alerts = umEditUtils.saveEdits(editHistoryEntry);
	} catch (error) {
		result.error.push(error.toString());
	}
	finally{
		if(alerts) {
			result.info = result.info.concat(alerts.info);
			result.error = result.error.concat(alerts.error);
		}
	}
	return result;
}
