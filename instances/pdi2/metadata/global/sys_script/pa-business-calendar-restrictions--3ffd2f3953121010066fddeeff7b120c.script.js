(function executeRule(current, previous /*null when async*/) {

	var widget = current.widget;
	var indicatorGroup = current.widget.tag;
	
	// the indicator records associated with this.
	var indicator = current.indicator;

	var calendarFreq = current.indicator.calendar_freq;

	var isBizCalIndicator = (calendarFreq != '') ? true : false;

	var indicatorGroupHasBizCal = false;

	var message = gs.getMessage('The widget indicator you are creating does not use the same calendar frequency as the main indicator or indicator group. Widget indicators must use the same calendar frequency as the main indicators of the widget.');

	// Check whether the indicator Group has business calendar association
	if (JSUtil.notNil(indicatorGroup)) {
		var gr = new GlideRecord('pa_m2m_indicator_tags');
		gr.addQuery('tag', indicatorGroup);
		gr.query();
		while(gr.next()) {
			if (isBizCalIndicator) {
				if (gr.indicator.calendar_freq == '' || gr.indicator.calendar_freq != calendarFreq) {
					current.setAbortAction(true);
					gs.addErrorMessage(message);
					return;
				}
			} else {
				if (!(gr.indicator.calendar == 'standard' || gr.indicator.calendar == '')) {
					current.setAbortAction(true);
					gs.addErrorMessage(message);
					return;
				}
			}
		}
	}

	if (JSUtil.notNil(current.widget.indicator)) {
		if (isBizCalIndicator && current.widget.indicator.calendar_freq != calendarFreq) {
			current.setAbortAction(true);
			gs.addErrorMessage(message);
			return;
		}
	}

})(current, previous);
