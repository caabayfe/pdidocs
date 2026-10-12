(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var LOGGER = new sn_oe_sfs.SidebarLogger().withName('ScriptedRESTResource_Slack_Chats').createLogger();
	// Read the raw body first. This can only be read once.
	var rawBody = request.body.dataString;
	var payload;
	try {
		payload = JSON.parse(rawBody);
	} catch (e) {
		LOGGER.error('ScriptedRESTResource::Slack::Chats | Unparseable request body');
		response.setStatus(400);
		return;
	}

	// Handshake. Echoes back a value Slack sent.
	if (payload.challenge) {
		LOGGER.debug('ScriptedRESTResource::Slack::Chats | Handshake initiated, sending a challenge back');
		response.setStatus(200);
		response.setContentType('text/plain');
		response.getStreamWriter().writeString(payload.challenge);
		return;
	}

	// Verify the Slack signature before acting on anything in the payload.
	var verified = false;
	try {
		verified = new sn_oe_sfs.SlackMessageValidator().validateInboundMessage(request.headers, rawBody) === 'SUCCESS';
	} catch (e) {
		LOGGER.error('ScriptedRESTResource::Slack::Chats | Signature verification errored');
	}

	if (!verified) {
		LOGGER.error('ScriptedRESTResource::Slack::Chats | Rejected inbound message: Slack signature verification failed');
		response.setStatus(401);
		return;
	}

	var slackProviderID = '1f2e35d1a3f382106cdec213d51e61ae';

	// Skip the outbound message echo back from Slack
	if (payload.event && payload.event.type == 'message' && payload.event.subtype == 'file_share' && !payload.event.hasOwnProperty('client_msg_id'))
		return;

	LOGGER.debug('ScriptedRESTResource::Slack::Chats | Inbound message received. Payload: {0}', rawBody);
	sn_collab.CollabChatScriptObject.processInboundMessageByProvider(JSON.stringify(request.headers), rawBody, slackProviderID);
})(request, response);
