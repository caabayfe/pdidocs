(function executeRule(current, previous /*null when async*/) {
	var midWebserverMaxApiKeys = gs.getProperty('mid.webserver.max.api.keys', 10);	
	var gr = new GlideRecord('mid_webserver_api_key_credentials');
	gr.queryNoDomain();
	var apiKeysAmount = gr.getRowCount();
	if(apiKeysAmount >= parseInt(midWebserverMaxApiKeys)){
		gs.addErrorMessage(gs.getMessage('The total number of API Keys has already reached the maximum number of {0}. If you wish to create a new API Key, delete an existing one.', midWebserverMaxApiKeys));
		current.setAbortAction(true);
	}				
})(current, previous);
