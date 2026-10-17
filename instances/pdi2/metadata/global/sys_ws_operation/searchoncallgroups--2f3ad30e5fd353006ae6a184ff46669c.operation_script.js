(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var reqBody = request.body.data;
    var offset = JSUtil.nil(request.queryParams.offset) ? "" : request.queryParams.offset;
	var textSearch = JSUtil.nil(reqBody.text) ? "" : reqBody.text;
	var textSearchType = reqBody.textSearchType;
	var excludeGroupSysIds = JSUtil.nil(reqBody.ignoreGroupSysIds) ? "" : reqBody.ignoreGroupSysIds;
	var dateTime = JSUtil.nil(request.queryParams.date_time) ? new GlideDateTime().getValue() : request.queryParams.date_time;
	var groupsLimit;
	if (!JSUtil.nil(request.queryParams.group_limit));
		groupsLimit = parseInt(request.queryParams.group_limit);
	var onCallRotation = new OnCallRotation();
	var onCallGroups = onCallRotation.onCallGroups(dateTime, offset, groupsLimit, 'search', textSearch, excludeGroupSysIds, textSearchType);
	if (onCallRotation.log.atLevel(GSLog.DEBUG)) {
		onCallRotation.timer.timerName += " REST-POST /searchoncallgroups";
		onCallRotation.log.debug(onCallRotation.timer.result());
	}
	return onCallGroups;

})(request, response);
