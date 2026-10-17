(function executeRule(current, previous /*null when async*/) {
	if (g_scratchpad.show_conference_provider)
		gs.addInfoMessage(gs.getMessage('Please configure either Notify group or Conference provider in a choice.'));
})(current, previous);
