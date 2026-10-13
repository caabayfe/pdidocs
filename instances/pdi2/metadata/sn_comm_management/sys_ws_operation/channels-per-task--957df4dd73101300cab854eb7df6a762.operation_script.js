(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var respData = {};
	var commManagementUtils = new CommunicationManagementUtil();
	var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(request.pathParams.table);
	var commTaskGR = new GlideRecord(handlerInstance.getCommTaskInstanceForTask());
	var channels = [];
	if (commTaskGR.get(request.pathParams.commTaskSysId)) {
		var channelGr = new GlideRecord(commManagementUtils.TABLES.COMM_CHANNEL);
		channelGr.addQuery(commManagementUtils.COLUMNS.COMM_TASK, commTaskGR.getUniqueValue());
		channelGr.query();
		while(channelGr.next())
			channels.push(channelGr.comm_channel_config.type + '');

		var channelMap = commManagementUtils.getChannelMap(request.pathParams.table, channels);
		for (var channel in channelMap) {
			if (channelMap[channel].classification != 'update')
				continue;
			if (channelMap[channel].available) {
				commManagementUtils.prepareDataForCommunication(channelMap[channel], commTaskGR, respData);
			}
		}
	} else
		return new sn_ws_err.NotFoundError("Communication task not found");

	return respData;
})(request, response);
