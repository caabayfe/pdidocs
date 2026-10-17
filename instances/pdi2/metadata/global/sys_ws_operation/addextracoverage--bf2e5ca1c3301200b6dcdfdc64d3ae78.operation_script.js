(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var maxDateRangeDaysDuration = parseInt(gs.getProperty("com.snc.on_call_rotation.calendar_span.max_date_range_days", "30"));
	var coverageDateDiff = gs.dateDiff(request.queryParams.start_date, request.queryParams.end_date, true);
	if (JSUtil.nil(coverageDateDiff)) {
		throw "Invalid extra time spans";
	}
	var providedCoverageDuration = parseInt(coverageDateDiff / (24 * 60 * 60));
	if (providedCoverageDuration > maxDateRangeDaysDuration) {
		throw "Can not provide extra time for more than " + maxDateRangeDaysDuration + " consecutive days.";
	}
	return new OCAddItem()
		.setStartDateTime(request.queryParams.start_date)
		.setEndDateTime(request.queryParams.end_date)
		.setRotaSysId(request.queryParams.rota_id)
		.addExtraCoverage();
})(request, response);
