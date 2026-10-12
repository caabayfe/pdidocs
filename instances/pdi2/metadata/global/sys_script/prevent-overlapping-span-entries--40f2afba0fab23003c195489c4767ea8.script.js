(function executeRule(current, previous /*null when async*/) {

	if (sn_bc.GlideBusinessCalendarUtil.isLegacySchedule(current.calendar.sys_class_name))
		return;

	if (current.start >= current.end) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Start must be before end"));

		return;
	}
	
	var start = current.start;
	var end = current.end;
	var startField = "start";
	var endField = "end";

	// current start or end is between an existing start or end
	var queryString = "calendar=" + current.calendar + "^" + startField + "<" + start + "^" + endField + ">" + start + "^NQcalendar=" + current.calendar + "^" + startField + "<" + end + "^" + endField + ">" + end;
	
	// existing start or end are between current start or end
	queryString += "^NQcalendar=" + current.calendar + "^" + startField + ">" + start + "^" + startField + "<" + end + " ^NQcalendar=" + current.calendar + "^" + endField + ">" + start + "^" + endField + "<" + end;
	
	queryString += "^NQcalendar=" + current.calendar + "^" + startField + "=" + start + "^OR" + endField + "=" + end;
	
	var gr = new GlideRecord("business_calendar_span");
	gr.addEncodedQuery(queryString,true);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Business calendar entries may not overlap within a calendar"));
	}

})(current, previous);
