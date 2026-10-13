(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var offset = JSUtil.nil(request.queryParams.offset) ? "" : request.queryParams.offset;
	var dateTime = JSUtil.nil(request.queryParams.date_time) ? new GlideDateTime().getValue() : request.queryParams.date_time;
	var groupsLimit;
	var filter = JSUtil.nil(request.queryParams.filter) ? "all" : request.queryParams.filter;
	if (!JSUtil.nil(request.queryParams.group_limit))
		groupsLimit = parseInt(request.queryParams.group_limit);
	var onCallRotation = new OnCallRotation().setCheckAccess(true);
	var onCallGroups;
	if (!JSUtil.nil(request.queryParams.group)) {
		var group = request.queryParams.group;
		onCallGroups = new OCRotationV2().getIndividualGroupData(group);
		onCallGroups = onCallRotation.processIndividualOCData(onCallGroups, dateTime);
	}
	else {
		onCallGroups = onCallRotation.onCallGroups(dateTime, offset, groupsLimit, filter);
		if (onCallRotation.log.atLevel(GSLog.DEBUG)) {
			onCallRotation.timer.timerName += " REST-GET /oncallgroups";
			onCallRotation.log.debug(onCallRotation.timer.result());
		}
	}
	return onCallGroups;
})(request, response);
