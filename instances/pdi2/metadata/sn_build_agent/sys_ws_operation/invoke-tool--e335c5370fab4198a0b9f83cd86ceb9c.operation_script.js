(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	response.setContentType('application/json');

	var serverId = request.pathParams.serverId;
	var toolName = request.pathParams.toolName;

	var knownServers = ['sn-itsm-prod', 'sn-hrsd-prod', 'sn-secops-prod'];
	if (knownServers.indexOf(serverId) === -1) {
		response.setStatus(404);
		response.setBody({ error: 'Server not found: ' + serverId });
		return;
	}

	var body = request.body ? JSON.parse(request.body.dataString) : {};
	if (!body.inputs || !body.inputs.toolArguments) {
		response.setStatus(400);
		response.setBody({ error: 'Missing required field: inputs.toolArguments' });
		return;
	}
	var toolArguments = body.inputs.toolArguments;

	var echoText = JSON.stringify({ serverId: serverId, toolName: toolName, receivedArgs: toolArguments });

	response.setStatus(200);
	response.setBody({
		status: 'success',
		server_id: serverId,
		tool_name: toolName,
		result: {
			status: 'success',
			response: {
				content: [{ type: 'text', text: echoText }]
			},
			execution_id: 'mock-' + new GlideDateTime().getNumericValue()
		}
	});
})(request, response);
