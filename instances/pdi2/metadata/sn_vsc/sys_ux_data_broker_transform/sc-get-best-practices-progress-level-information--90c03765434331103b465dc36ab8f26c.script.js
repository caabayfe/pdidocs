function transform(input) {
	var progressInfo = {
		"isNew" : false,
		"allCompleted" : false,
		"most_recentlyUpdated_bpName" :  null,
		"most_recentlyUpdated_bpSysId" : null
	};
	var scConstants = new sn_vsc.SecurityCenterConstants();;
	var bpTable = scConstants.BEST_PRACTICES_CONFIG;

	var bestPracticesGr = new GlideRecord(bpTable);
	var encodedQueries = scConstants.bestPracticesEncodedQueries;
	bestPracticesGr.addEncodedQuery(encodedQueries["getAllActiveNotRemovedRecords"]);
	bestPracticesGr.query();
	var totalActiveRecords = bestPracticesGr.getRowCount();
	
	// if all active records are completed, then we will show a success variation of next up section in the UI
	bestPracticesGr = new GlideRecord(bpTable);
	bestPracticesGr.addEncodedQuery(encodedQueries["getAllActiveCompletedRecords"]);
	bestPracticesGr.query();
	if (bestPracticesGr.getRowCount() == totalActiveRecords) {
		progressInfo["allCompleted"] = true;
		return progressInfo;
	}

	// if one of all the active records are in progress, then get the most recently updated best practice details
	bestPracticesGr = new GlideRecord(bpTable);
	bestPracticesGr.addEncodedQuery(encodedQueries["getAllActiveInProgressRecords"]);
	bestPracticesGr.orderByDesc('sys_updated_on');
	bestPracticesGr.query();
	if (bestPracticesGr.getRowCount() > 0) {
		bestPracticesGr.next();
		progressInfo["most_recentlyUpdated_bpName"] = bestPracticesGr.getDisplayValue("name");
		progressInfo["most_recentlyUpdated_bpSysId"] = bestPracticesGr.getDisplayValue("sys_id");
		return progressInfo;
	}

	// if all the active records are in open state, then we should show the build a foundation variation of the next up section in the UI
	bestPracticesGr = new GlideRecord(bpTable);
	bestPracticesGr.addEncodedQuery(encodedQueries["getAllOpenStateRecords"]);
	bestPracticesGr.query();
	if (bestPracticesGr.getRowCount() == totalActiveRecords) {
		progressInfo["isNew"] = true;	
		return progressInfo;
	}

	// for all other situations we will default to the new state - "build a foundation"
	progressInfo["isNew"] = true;
	return progressInfo;
}
