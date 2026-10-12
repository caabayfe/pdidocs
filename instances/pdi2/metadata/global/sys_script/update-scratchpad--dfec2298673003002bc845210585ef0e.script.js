(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isPremiumActive = new SNC.PAUtils().isPremium();
	g_scratchpad.isBusinessCalendar = (current.indicator && current.indicator.calendar != '' && current.indicator.calendar != 'standard');

})(current, previous);
