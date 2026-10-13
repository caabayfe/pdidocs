(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payload = GlideStringUtil.getStringFromStream(request.body.dataStream);
	var queryParams = request.queryParams;
	var source = queryParams['source'] ? queryParams['source'][0] : '';
	var headers = request.headers;
	delete headers["authorization"]; // dont save the base64 user/password
	
	var parsedPayload = JSON.parse(payload);
	var awsMessage = {};
	var preProcessedData = {};
	if (isAWSEvent(headers)) {
		try {
			awsMessage = JSON.parse(parsedPayload.Message);
			preProcessedData = preProcessEventAWS(awsMessage);
		} catch (e) {
			/* Preprocessing failed, but we still want to continue event processing without assigning epoch timestamp and resourceID in advance */
			gs.info('Preprocessing failed for an AWS event, continuing without preprocessed fields');
		}
		if (!filterAWSEvent(parsedPayload, awsMessage)) {
			return;
		}
	} else if (isAzureEvent(headers)) {
		try {
			preProcessedData = preProcessEventAzure(parsedPayload);
		} catch (e) {
			/* Preprocessing failed, but we still want to continue event processing without assigning epoch timestamp and resourceID in advance */
			gs.info('Preprocessing failed for an Azure event, continuing without preprocessed fields');
		}
	}
	var eventGr = new GlideRecord('sn_cmp_cloud_event');
	eventGr.initialize();
	eventGr.setValue('payload', payload);
	eventGr.setValue('headers', global.JSON.stringify(headers));
	eventGr.setValue('source', source);
	eventGr.setValue('query_params', global.JSON.stringify(queryParams));
	if (preProcessedData.resource_id)
		eventGr.setValue('resource_id', preProcessedData.resource_id);
	if (preProcessedData.event_time_epoch)
		eventGr.setValue('event_time_epoch', preProcessedData.event_time_epoch);
	eventGr.insert();
		
})(request, response);

function isAWSEvent(headers) {
	return headers && !gs.nil(headers['x-amz-sns-message-type']);
}

function isAzureEvent(headers) {
	return headers && headers['user-agent'] && (headers['user-agent'].startsWith('IcMBroadcaster'));
}

function preProcessEventAWS(message) {
	var preProcessedData = {};
	if (message) {
		if (!gs.nil(message.configurationItem.resourceId))
			preProcessedData.resource_id = message.configurationItem.resourceId;
		if (message.notificationCreationTime)
			preProcessedData.event_time_epoch = new Date(message.notificationCreationTime).getTime();
	}
	return preProcessedData;
}

function preProcessEventAzure(parsedPayload) {
	var preProcessedData = {};
	if (parsedPayload && !gs.nil(parsedPayload.data.context.activityLog)) {
		var activityLog = parsedPayload.data.context.activityLog;
		if (activityLog.resourceId)
			preProcessedData.resource_id = activityLog.resourceId;
		if (activityLog.eventTimestamp) {
			var strTimeStamp = activityLog.eventTimestamp;
			strTimeStamp = strTimeStamp.substring(0, strTimeStamp.indexOf('.') + 4 ) +'Z';
			preProcessedData.event_time_epoch = new Date(strTimeStamp).getTime();
		}
	}
	return preProcessedData;
}

function filterAWSEvent(parsedPayload, awsMessage) {
	return (parsedPayload && (parsedPayload.Type == 'SubscriptionConfirmation' ||
			(parsedPayload.Type == 'Notification' && awsMessage && (awsMessage.messageType == 'ConfigurationItemChangeNotification' || awsMessage['detail-type'] == 'Tag Change on Resource'))));
}
