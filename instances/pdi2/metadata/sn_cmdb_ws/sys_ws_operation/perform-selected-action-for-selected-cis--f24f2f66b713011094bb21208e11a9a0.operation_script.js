(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var input = request.body.data;
	
    var sysIds = input.sysIds;
    var action = input.action;
	var userComment = input.userComment;
	var taskSysId = input.taskSysId;
	var currentAttestationStatus = input.currentAttestationStatus;
	var allRecordsSelected = input.allRecordsSelected;
	var excludedSysIds = input.excludedSysIds;
	var selectionCount = input.selectionCount || 0;
	var query = input.query;
	
	var attestationUtil = new sn_cmdb_ws.CMDBAttestationUtil();
	
    if (!allRecordsSelected && (!sysIds || sysIds.length < 1)) {
        return attestationUtil._ERROR_MESSAGES.INVALID_INPUT;
    }

    var availableActions = ['attest','unattest','reject','duplicate','exclude'];

    if (availableActions.indexOf(action) == -1) {
        return attestationUtil._ERROR_MESSAGES.INVALID_ACTION;
    }

	var result;
	if(action == 'duplicate') {
		result = attestationUtil.removeDuplicates(taskSysId, sysIds, action, userComment, allRecordsSelected, currentAttestationStatus, excludedSysIds, query);
	} else if(action == 'exclude') {
		result = attestationUtil.excludeCis(taskSysId, sysIds, action, userComment, allRecordsSelected, currentAttestationStatus, excludedSysIds, query);
	} else {
		if (selectionCount > attestationUtil.UI_DEFAULT_LIMIT.ATTEST_RECORDS) {
			var progressId = new sn_cmdb_ws.CMDBWsProgressMonitorUtil().createProgress(taskSysId);
			gs.eventQueue(attestationUtil.NOTIFICATION_EVENTS.ATTESTATION_ACTION_ASYNC, null, progressId, JSON.stringify({
				taskSysId: taskSysId,
				sysIds: sysIds,
				action: action,
				userComment: userComment,
				allRecordsSelected: allRecordsSelected,
				currentAttestationStatus: currentAttestationStatus,
				excludedSysIds: excludedSysIds,
				progressId: progressId,
				query: query
			}));
			result = {
				progressId: progressId
			};
		} else {
			result = attestationUtil.performAttestationAction(taskSysId, sysIds, action, userComment, allRecordsSelected, currentAttestationStatus, excludedSysIds, progressId, query);
		}
	}

	response.setBody(result);

})(request, response);
