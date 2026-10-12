(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.maxQueryLimit = parseInt(gs.getProperty('com.glide.pad.core.model.scheduledTrigger.maxQueryLimit', 1000));
})(current, previous);
