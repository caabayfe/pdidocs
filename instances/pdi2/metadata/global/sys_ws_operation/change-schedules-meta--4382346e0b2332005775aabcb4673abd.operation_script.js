(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	// Ensuring that we provide spans according to the session TZ without unnecessary manipulation on the client using g_tz_offset, which provides an offset with an hour less.
	var startDate = new GlideDateTime();
	startDate.setDisplayValueInternal(request.pathParams.start_date);
	var endDate = new GlideDateTime();
	endDate.setDisplayValueInternal(request.pathParams.end_date);

	var changeGr = new GlideRecord(ChangeRequestCalendarSNC.CHANGE);
	if (changeGr.get(request.pathParams.sys_id)) {
		var cchange;

		if(GlidePluginManager.isActive("com.snc.change_management.cab"))
			cchange = new sn_change_cab.CABChangeRequest(changeGr);
		else
			cchange = new global.ChangeRequestCalendar(changeGr);

		var data = cchange.getRelatedSchedules(startDate, endDate);
		return {
			maintenance: cchange.getScheduleInformation(data.maintenance, startDate, endDate),
			blackout: cchange.getScheduleInformation(data.blackout, startDate, endDate),
			warn_invalid_conflict_checker: data.is_invalid_conflict_checker_si
		};
	} else {
		return new sn_ws_err.NotFoundError('Given Change Request not found');
	}

})(request, response);
