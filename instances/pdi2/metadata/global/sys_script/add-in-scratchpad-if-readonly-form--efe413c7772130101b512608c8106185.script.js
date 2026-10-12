(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.pa_dm_source_form_readonly = new global.PAAnalyticsSourceUtil().alreadyActivated(current.id);

})(current, previous);
