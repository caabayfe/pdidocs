(function process(g_request, g_response, g_processor) {

	if (g_request.getParameter('sysparm_request_type') == 'verify_signature') {
		var avs = new global.AssessmentVerifySignature();
		var answer = (avs.authorizedUser(g_request.getParameter('sysparm_user'), g_request.getParameter('sysparm_password'))) ? 'true' : 'false';
		g_processor.writeOutput(answer);
	} else {
		var params = g_request.getParameterNames();
		var submitResponse;
		if (params.length > 0) {
			var length = params.length;
			var data = new global.JSON().decode(params[length-1]);
			submitResponse = new global.AssessmentSubmitProcessor().processRequest(data);
		} else {
			gs.error('Parameters are empty');
			submitResponse = {"success": "false", "message": "Missing form parameters."};
		}
		g_processor.writeOutput(new global.JSON().encode(submitResponse));
	}

})(g_request, g_response, g_processor);
