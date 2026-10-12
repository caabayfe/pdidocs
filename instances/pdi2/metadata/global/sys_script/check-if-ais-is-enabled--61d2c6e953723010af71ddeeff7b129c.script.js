(function executeRule(current, previous /*null when async*/) {

	if (!VAAISearchHelper.isSearchEnabled()){
		var url = gs.getProperty('glide.servlet.uri') + 'now/conversation/settings/virtual-agent';
		var link = '<a href="' + url + '">' + gs.getMessage("View settings.") + '</a>';
		gs.addErrorMessage(gs.getMessage('AI Search is not currently configured on this instance. {0}', link));
		current.topic = previous.topic;
	}
		

})(current, previous);
