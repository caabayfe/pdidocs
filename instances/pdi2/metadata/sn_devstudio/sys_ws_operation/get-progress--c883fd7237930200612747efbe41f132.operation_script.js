(function process(request, response) {
    var gr = new GlideRecord('sys_execution_tracker'),
		errorInfoFinder = new sn_vcs.SourceControlErrorInfoFinder(),
		historyRecordFinder = new sn_vcs.SourceControlHistoryFinder(),
		transactionId = request.pathParams.transactionId,
		result;
	
	if (gr.get(transactionId) && gr.canRead()) {
		var detailMessage = gr.getValue('detail_message');
		var deepestId = sn_vcs.SourceControl.getDeepestRunningChild(transactionId);
		var deepestChild = new GlideRecord('sys_execution_tracker');
		deepestChild.get(deepestId);
		if (deepestChild.isValidRecord()) {
			var childMessage = deepestChild.getValue('detail_message');
			if (!gs.nil(childMessage))
				detailMessage = childMessage;
		}
	
		// states: 0 - pending, 1 - running, 2 - successful, 3 - failed, 4 - cancelled
		result = {
			name: gr.getValue('name'),
			state: gr.getValue('state'),
			message: gr.getValue('message'),
			detailMessage: detailMessage,
			result: gr.getValue('result'),
			sysId: gr.getValue('sys_id'),
			percentComplete: gr.getValue('percent_complete'),
			completionTime: gr.getValue('completion_time')
		};
	} else {
		result = {
			name: '',
			state: '0',
			message: 'Waiting for tracker',
			detailMessage: '',
			result: '',
			sysId: '',
			percentComplete: '',
			completionTime: ''
		};
	}
	
	if (result.state === '3') {
		result.errorCode = errorInfoFinder.getErrorCodeFromTracker(transactionId);
		result.errorMessage = errorInfoFinder.getErrorMessageFromTracker(transactionId);
	}	
	
	result.historyRecordSysId = historyRecordFinder.getHistoryRecordSysIdFromTracker(transactionId);
	result.historyLogWarningCount = historyRecordFinder.getHistoryLogWarningCountFromTracker(transactionId);
	result.historyLogErrorCount = historyRecordFinder.getHistoryLogErrorCountFromTracker(transactionId);
	result.claimConflictsCount = historyRecordFinder.getClaimConflictsCountFromTracker(transactionId);
	result.viewDetailsLink = historyRecordFinder.getInstallConflictsViewDetailsLinkFromTracker(transactionId);

	result.invalidXMLCount = errorInfoFinder.getValueFromResult(transactionId, 'sys_log.invalid_xml_count') || '0';
	result.sysLogLink = errorInfoFinder.getValueFromResult(transactionId, 'sys_log.view_details_link');
	
	response.setBody(result);
	response.setContentType('application/json');
	response.setStatus(200);

})(request, response);
