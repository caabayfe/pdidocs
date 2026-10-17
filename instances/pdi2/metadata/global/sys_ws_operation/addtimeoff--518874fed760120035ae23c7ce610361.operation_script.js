(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var maxDateRangeDaysDuration = parseInt(gs.getProperty("com.snc.on_call_rotation.calendar_span.max_time_off_days", "365"));
	var coverageDateDiff = gs.dateDiff(request.queryParams.start_date_time, request.queryParams.end_date_time, true);
	if (JSUtil.nil(coverageDateDiff)) {
		throw "Invalid time off spans";
	}
	var providedCoverageDuration = parseInt(coverageDateDiff / (24 * 60 * 60));
	if (providedCoverageDuration > maxDateRangeDaysDuration) {
		throw "Can not provide time off for more than " + maxDateRangeDaysDuration + " consecutive days.";
	}

	var formatter = null;
	var scriptInclude = OCFormatterMapping.formatters[request.queryParams.format + ""];
	if (scriptInclude)
		formatter = new scriptInclude();
	return new OCAddItem(formatter)
	.setMemberSysId(request.queryParams.user_id)
	.setGroupSysId(request.queryParams.group_id)
	.setStartDateTime(request.queryParams.start_date_time)
	.setEndDateTime(request.queryParams.end_date_time)
	.setAllDay(request.queryParams.all_day)
	.setNotes(request.queryParams.notes)
	.setProposedCover(request.queryParams.proposed_cover)
	.timeOff();
})(request, response);
