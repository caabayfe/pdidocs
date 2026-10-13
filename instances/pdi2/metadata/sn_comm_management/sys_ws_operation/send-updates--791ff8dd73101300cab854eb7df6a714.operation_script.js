(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var respData = {};

	if (request.body.data) {
		var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(request.pathParams.table);
		var commManagementUtils = new CommunicationManagementUtil();
		var commTaskGR = new GlideRecord(handlerInstance.getCommTaskInstanceForTask());
		var channelActionMap = {};
		var data = request.body.data;
		if (commTaskGR.get(request.pathParams.commTaskSysId)) {
			var isValidRequest = new sn_comm_management.CommunicationManagementUtil().canSendUpdates(commTaskGR);
			if (!isValidRequest) {
				var respError = new sn_ws_err.ServiceError();
				respError.setStatus(403);
				respError.setMessage("Security constraints prevent access to requested resource");
				return respError;
			}

			if (data.sms) {
				respData.sms = {};
				if (request.body.data.sms.from && request.body.data.sms.toNumbers && request.body.data.sms.toNumbers.length) {
					if (!request.body.data.sms.message)
						return new sn_ws_err.NotFoundError("'message' is required parameter for sending sms");
					
					var notifyNumber = request.body.data.sms.from;
					commManagementUtils.sendSMS(notifyNumber, request.body.data.sms.toNumbers, request.body.data.sms.message, commTaskGR);
					channelActionMap[commManagementUtils.CHANNELS.SMS] = {action: commManagementUtils.CHANNEL_ACTIONS.SENT};
					respData.sms.status = "SUCCESS";
				}
			}
			if (data.dex_desktop_assistant) 
				channelActionMap[commManagementUtils.CHANNELS.DEX_DESKTOP_ASSISTANT] = {action: commManagementUtils.CHANNEL_ACTIONS.SENT};
			if (data.email) {
				channelActionMap[commManagementUtils.CHANNELS.EMAIL] = {action: commManagementUtils.CHANNEL_ACTIONS.SENT};
			}
			
			for (var channelName in data) {
				if (!data[channelName].is_collaboration)
					continue;
				channelActionMap[channelName] = {action: commManagementUtils.CHANNEL_ACTIONS.SENT};
				channelActionMap[channelName].postData = data[channelName];
			}

			commManagementUtils.updateChannelState(channelActionMap, handlerInstance, commTaskGR);
		} else
			return new sn_ws_err.NotFoundError("Communication task not found");
	} else
		return new sn_ws_err.BadRequestError("Not a valid request");

  //TODO: update acl once new roles are available.
	return respData;
})(request, response);
