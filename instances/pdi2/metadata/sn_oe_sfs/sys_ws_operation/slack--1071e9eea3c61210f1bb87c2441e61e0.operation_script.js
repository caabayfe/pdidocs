(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // implement resource here
	var payload = request.body.data;
	var util = new sn_oe_sfs.CollabSlackUtil();
	var result = {};
	switch (payload.operation) {
		case 'SAVE_CONFIG':
			result = util.saveConfig(payload.credentials, payload.isSlackEnabled);
			// activate and execute "Slack Users Auto Syncing" scheduled job
			if (result.status == 200) {
				util.activateAndExecuteSlackSchdlJob();
			}
			break;
		
		case 'DELETE_CONFIG':
			result = util.deleteConfig();
			break;
	}
	response.setContentType("application/json");
	response.setStatus(result.status);
	response.setBody(result.body);

})(request, response);
