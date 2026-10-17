(function executeRule(current, previous /*null when async*/) {
	try {
		// getGlideURI() can throw so catch if it is null
		var uri = gs.action.getGlideURI();
		if (uri.toString().includes('sys_cs_channel_list')) {
			gs.addInfoMessage(gs.getMessage('You can use the channels that are preconfigured in your instance or add a new one'));
		}
	} catch (e) {
		// ignored
	}

})(current, previous);
