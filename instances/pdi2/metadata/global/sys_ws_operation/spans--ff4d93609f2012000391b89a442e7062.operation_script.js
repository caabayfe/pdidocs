(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var formatter = null;
	var from = JSUtil.nil(request.queryParams.from) ? '' : request.queryParams.from + '';
	var targetTimezone = JSUtil.nil(request.queryParams.target_tz) ? '' : request.queryParams.target_tz + '';
	
	var scriptInclude = OCFormatterMapping.formatters[request.queryParams.format + ""];
	if (scriptInclude === OCDHTMLXCalendarFormatter)
		formatter = new scriptInclude(request.queryParams.group_events, request.queryParams.target_tz);
	else if (scriptInclude)
		formatter = new scriptInclude();

	function getTZ(timezone) {
		var tz = new GlideSchedule();
		tz.setTimeZone(timezone);
		return tz.getTZ();
	}
	
	var userTimezone = gs.getUser().getTZ();
	if (targetTimezone && targetTimezone != userTimezone) {
		if (from.indexOf(':') == -1)
			from = from + " 00:00:00";
		var startGdt = new GlideDateTime();
		startGdt.setTZ(getTZ(targetTimezone));
		startGdt.setDisplayValueInternal(from);
		startGdt.setTZ(getTZ(userTimezone));
		from = startGdt.getDisplayValueInternal();
	}
	else {
		if (from.indexOf(':') == -1)
			from = from + " 00:00:00";
	}

	if (JSUtil.nil(request.queryParams.group_ids) && JSUtil.nil(request.queryParams.rota_ids) && JSUtil.nil(request.queryParams.roster_ids) && JSUtil.nil(request.queryParams.user_ids)) {
		response.setStatus(400);
		response.setHeaders({
			'Content-Type': 'application/json'
		});
		var writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({
			message: gs.getMessage("At least one of the parameters: group_ids, rota_ids, roster_ids, or user_ids must be provided."),
			messageType: "error"
		}));
		return;
	}
	
	var ocrRotaV2 = new OCRotationV2(null, formatter);
	var result = {};
	result.spans = ocrRotaV2
		.setCheckAccess(true)
		.setStartDate(from, true)
		.setEndDate(request.queryParams.to, false)
		.setGroupIds(request.queryParams.group_ids)
		.setRotaIds(request.queryParams.rota_ids)
		.setRosterIds(request.queryParams.roster_ids)
		.setUserIds(request.queryParams.user_ids)
		.setSpanFetchPreference(request.queryParams.fetch_preference)
		.getSpans();
	
	var memberSpansBeforeExclude = ocrRotaV2.getMemberSpansBeforeExclude();

	if ((request.queryParams.group_ids + '').split(',').length > 1 && request.queryParams.format == 'dhtmlx') {
			result.messages = [];
			result.messages.push({
				message: 'Gaps is not supported for multiple groups query.',
				messageType: 'warning'
			});
			result.messages.push({
				message: 'Conflicts is not supported for multiple groups query.',
				messageType: 'warning'
			});
	}
	else {
		var ocwUtils = new OnCallWorkbenchUtils();
		var access = ocwUtils.getAccessDetails(request.queryParams.group_ids + "");
		if (access.isManager && request.queryParams.format == 'dhtmlx' && result.spans.length > 0) {//only process this if request is from DHTMLX Calendar
			var gapConflictsSpans = result.spans; 
			var ocOddityChecker = new OCOddityChecker();
			var dateDiff = gs.dateDiff(request.queryParams.from, request.queryParams.to, true);
			var dateDiffInDays = parseInt(dateDiff / (24 * 60 * 60));
			result.gaps = ocOddityChecker.getGaps(request.queryParams.from, request.queryParams.to, request.queryParams.group_ids, dateDiffInDays, gapConflictsSpans, memberSpansBeforeExclude);
			result.conflicts = ocOddityChecker.getConflictsInGroup(request.queryParams.from, request.queryParams.to, request.queryParams.group_ids, dateDiffInDays, gapConflictsSpans);
		}
	}
	if (ocrRotaV2.log.atLevel(GSLog.DEBUG)) {
		ocrRotaV2.timer.timerName += " REST-GET spans";
		ocrRotaV2.log.debug(ocrRotaV2.timer.result());
	}
	
	function getCurrentDateTime(timezone) {
		if (JSUtil.notNil(timezone)) {
			var schedule = new GlideSchedule();
			schedule.setTimeZone(timezone + "");
			var tz = schedule.getTZ();
			if (JSUtil.notNil(tz)) {
				var gdt = new GlideDateTime();
				gdt.setTZ(tz);
				return gdt.getDisplayValueInternal();
			}
		}
		return new GlideDateTime().getDisplayValueInternal();
	}
	
	result.current_date_time = getCurrentDateTime(request.queryParams.target_tz);

	response.setStatus(200);
	response.setHeaders({'Content-Type': 'application/json'});
	var writer = response.getStreamWriter();
	writer.writeString(new JSON().encode(result));
})(request, response);
