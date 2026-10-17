(function executeRule(current, previous /*null when async*/) {
	
	if (JSUtil.nil(current.indicator) || JSUtil.nil(current.tag))
		return;

	// validate the calendars conditions.
	var indicatorCalendars = current.indicator.calendar;
	var isCalendarIndicator = true;
	if (indicatorCalendars == '' || indicatorCalendars == 'standard')
		isCalendarIndicator = false;
	
	// total number of indicators associated with this group
	var currentGroup = current.tag;
	var gr = new GlideRecord('pa_m2m_indicator_tags');
	gr.addQuery('tag', currentGroup);
	gr.query();

	var tc = gr.getRowCount();

	var msg = gs.getMessage('You are trying to put indicators with different calendars in the same group. All indicators in a group must have the same calendar.');

	if (isCalendarIndicator) {
		var calendarFreq = current.indicator.calendar_freq;

		gr = new GlideRecord('pa_m2m_indicator_tags');
		gr.addQuery('tag', currentGroup);
		gr.addQuery('indicator.calendar_freq', calendarFreq);
		gr.query();
		
		var count = gr.getRowCount();
		if (count != tc) {
			current.setAbortAction(true);
			gs.addErrorMessage(msg);
		}
	} else {
		gr = new GlideRecord('pa_m2m_indicator_tags');
		gr.addEncodedQuery('indicator.calendar=standard^ORindicator.calendar=^tag='+ currentGroup);
		gr.query();

		var standardcount = gr.getRowCount();
		if (standardcount != tc) {
			current.setAbortAction(true);
			gs.addErrorMessage(msg);
		}
	}
})(current, previous);
