(function executeRule(current, previous /*null when async*/) {

	if (sn_bc.GlideBusinessCalendarUtil.isLegacySchedule(current.calendar.sys_class_name))
		return;

	var parent = current.calendar.parent;
	if (parent == "")
		return;
	
	var gr = new GlideRecord("business_calendar_span");
	gr.addQuery("calendar", parent);
	gr.addQuery("start", "<=", current.start);
	gr.addQuery("end", ">=", current.end);
	gr.query();
	if (gr.next())
		return;
	
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Span must be contained in span of parent calendar"));

})(current, previous);
