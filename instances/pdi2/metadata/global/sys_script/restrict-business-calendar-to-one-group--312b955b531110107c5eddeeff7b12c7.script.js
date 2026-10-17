(function executeRule(current, previous /*null when async*/) {
	if (current.business_calendar === previous.business_calendar)
		return;

	var gr = new GlideRecord('m2m_business_calendar_group_business_calendars');
	gr.addQuery('business_calendar', current.business_calendar);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('The selected business calendar is already mapped to a group'));
		current.setAbortAction(true);
	}

})(current, previous);
