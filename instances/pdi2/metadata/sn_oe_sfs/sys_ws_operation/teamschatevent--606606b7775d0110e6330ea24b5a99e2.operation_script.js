(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var queryParams = request.queryParams;
    //process validation request
    if (queryParams.validationToken != null) {
        gs.info('Collab Proxy: Webhook validation request received');
        sendValidationToken();
        gs.info('Collab Proxy: Webhook token validation response sent');
    } else {
        gs.info('Webhook notification received');
		var requestBody = request.body.dataString;
		gs.debug("C-CHAT: Webhook payload: " + requestBody);
		//acknowledge the change notification
		sendSuccessResponse();
		sn_collab.CollabChatScriptObject.processInboundMessage(requestBody, "Teams");
    }

    function sendValidationToken() {
        response.setContentType('text/plain');
        response.setStatus(200);
        var writer = response.getStreamWriter();
        writer.writeString(request.queryParams['validationToken']);
    }

    function sendSuccessResponse() {
        response.setStatus(202);
    }
})(request, response);
