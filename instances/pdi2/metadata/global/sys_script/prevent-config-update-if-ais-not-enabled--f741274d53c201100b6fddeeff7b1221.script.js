(function executeRule(current, previous /*null when async*/) {
	
	var isAisEnabled = new sn_ais.StatusApi().isAisEnabled();
	
	if (isAisEnabled || !current.ais_enabled) {
		return;
	}
	
	var url = gs.getProperty('glide.servlet.uri') + 'now/conversation/settings/virtual-agent';
	var link = '<a href="' + url + '">' + gs.getMessage("Request AI Search") + '</a>';
	gs.addErrorMessage(gs.getMessage('AI Search is not currently configured on this instance. {0} and submit your configuration again.', link));

	current.setAbortAction(true);

})(current, previous);
