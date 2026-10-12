(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var payloads = request.body.data;
	try {
		var subs = new AJAXFollowNotification();
		var table = payloads["sysparm_table"];
		var sysId = payloads["sysparm_sysid"];
		var userId = payloads["sysparm_userid"];
		var operation = payloads["sysparm_operation"];
		if (operation == "add") {
			subs.subscribeUser(table, sysId);
		} else if (operation == "delete") {
			subs.unSubscribeUser(sysId, userId);
		}
	} catch(err) {
		var exp = new sn_ws_err.BadRequestError(j2js(err).message);
		response.setError(exp);
	}
	

})(request, response);
