(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id;
	var tableName = (request.queryParams.table_name) ? request.queryParams.table_name : "change_request";
	var range = {};
	var msg = "";
	var gr = new GlideRecordSecure(tableName);
	if (gr.get(sysId)) {
		var startDateElem = gr.getElement("start_date");
		var endDateElem = gr.getElement("end_date");
		var canReadStartDate = (startDateElem) ? startDateElem.canRead() : false;
		var canReadEndDate = (endDateElem) ? endDateElem.canRead() : false;
		if (!canReadStartDate || !canReadEndDate) {
			return {
				resCode: 401,
				display_message: gs.getMessage("No permission to read Planned Start Date and/or Planned End Date fields")
			};
		}
		var scheduleWindow = gs.getProperty("change.conflict.next_available.schedule_window", "90");
		var intScheduleWindow = parseInt(scheduleWindow, 10);
		// 7 days is the smallest window of time used to search for the next available time
		if (intScheduleWindow < 7) {
			intScheduleWindow = 7;
			scheduleWindow = "7";
		// 1000 days is the largest window of time used to search for the next available time
		} else if (intScheduleWindow > 1000) {
			intScheduleWindow = 1000;
			scheduleWindow = "1000";
		}
		var gdtStartDate = new GlideDateTime();
		var gdtEndDate = new GlideDateTime();
		if (request.body.hasNext()) {
			range = request.body.nextEntry();
			if (range.startDate && range.endDate) {
				gdtStartDate.setValue(range.startDate);
				range.startDate = gdtStartDate;
			}
			else {
				gdtStartDate.setValue(gr.getValue("start_date"));
				range.startDate = new GlideDateTime(gs.beginningOfWeek(gdtStartDate));
			}

			// Always add the value of 'change.conflict.next_available.schedule_window' property to rangeStartDate
			gdtEndDate.setValue(range.startDate.getValue());
			gdtEndDate.addDaysUTC(intScheduleWindow);
			range.endDate = gdtEndDate;

			// adjust rangeStart to today or after if needed
			var today = new GlideDateTime();
			today.setValue(gs.beginningOfToday());
			if (range.startDate.before(today))
				range.startDate = today;

			// adjust rangeEnd is after today or end of current week if needed
			if (range.endDate.before(today)) {
				var endOfWeek = new GlideDateTime();
				endOfWeek.setValue(gs.endOfWeek(today));
				range.endDate = endOfWeek;
			}
		}
		var result = new ChangeConflictSchedule(gr, null, null, range).findScheduleWindows();
		if (result.spans.length === 0) {
			var startDate = _getFormattedDate(gdtStartDate);

			gdtStartDate.addDays(intScheduleWindow);
			var rangeStartFormatted = _getFormattedDate(gdtStartDate);

			gdtEndDate.setValue(gdtStartDate);
			gdtEndDate.addDays(intScheduleWindow);
			var rangeEndFormatted = _getFormattedDate(gdtEndDate);

			var values = [scheduleWindow, startDate, rangeStartFormatted, rangeEndFormatted];
			result.intro_message = gs.getMessage("There is no availability for {0} days from {1}", values);
			result.reason_message = result.message;
			result.display_message = gs.getMessage("Review change request conflicts or search for availability between {2} and {3}", values);
			result.suggested_range = {};
			result.suggested_range.start = gdtStartDate.getDisplayValue();
			result.suggested_range.end = gdtEndDate.getDisplayValue();
		}
		return result;
	}

	function _getFormattedDate(gdt) {
		var gd = new GlideDate();
		gd.setDisplayValue(gdt.getDisplayValue());
		return gd.getByFormat("MMMM d, y");
	}

	return {
		resCode: 400,
		display_message: gs.getMessage("Record not found")
	};
})(request, response);
