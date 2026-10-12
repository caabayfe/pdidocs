(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var input = request.body.data;
    var taskId = input.taskId;
    var action = input.action;
	var ciCount = input.ciCount;
	var hidePopupUserPref = input.hidePopupUserPref;
	
	var result = {
		action: action,
		ciCount: ciCount
	};
	
	var smartDetectionUtil = new sn_cmdb_ws.CMDBAttestationSmartDetectionUtil();
	if (action === 'review') {
		smartDetectionUtil.reviewSmartDetection(taskId, ciCount);
	} else if (action === 'accept') {
		var res = smartDetectionUtil.acceptSmartDetection(taskId, ciCount);
		result.ciCount = res.successCount;
		result.error = res.error;
	} else if (action === 'cancel') {
		smartDetectionUtil.cancelSmartDetection(taskId, ciCount, hidePopupUserPref);
	}
    response.setBody(result);

})(request, response);
