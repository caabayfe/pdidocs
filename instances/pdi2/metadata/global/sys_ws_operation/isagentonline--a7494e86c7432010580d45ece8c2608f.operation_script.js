(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var isOnline = function (id) {
		var agent = new GlideRecord('sys_atf_agent');
		if (!agent.get(id))
			return "false";

		if (agent.getValue("status") == "online")
			return "true";

		return "false";
	};
	
	var isOnlineResult = isOnline(request.queryParams.id[0]);
	var body = {
		online: isOnlineResult
	};
	
	response.setBody(body);
	response.setStatus(200);
})(request, response);
