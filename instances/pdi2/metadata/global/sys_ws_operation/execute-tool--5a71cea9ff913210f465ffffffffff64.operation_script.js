(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var startTime = new GlideDateTime().getNumericValue();

    try {
        var requestBody = request.body;
        var requestData = requestBody.data || {};

		// propagate the 'traceparent' header
        var headers = request.headers;
        var traceparentHeader = request.getHeader('traceparent');
        if (!gs.nil(traceparentHeader)) {
            requestData.meta = requestData.meta || {};
            requestData.meta.traceparent = traceparentHeader;
		}

        var toolRequest = Object.assign({}, requestData);

        gs.debug("[OG Tool Execution] Tool request: " + JSON.stringify(toolRequest, null, 2));
        var toolExecutionResponse = JSON.parse(sn_cs.VASystemObject.executeToolForOffGlide(toolRequest) || "{}");

        response.setContentType('application/json');
        response.setBody(toolExecutionResponse);
		if (toolExecutionResponse.async) {
			response.setStatus(201);
			toolExecutionResponse["status_code"]="201";
		} else {
			response.setStatus(200);
			toolExecutionResponse["status_code"]="200";
		}
        gs.debug("[OG Tool Execution] Tool response: " + JSON.stringify(response, null, 2));
    } catch (ex) {
        gs.error('[OG Tool Execution] Unable to execute tool with error: ' + JSON.stringify(ex));
        response.setStatus(500);
        response.setBody({
            "error": ex.message || JSON.stringify(ex)
        });
    } finally {
        gs.debug("[OG Tool Execution] Tool execution completed in : " + (new GlideDateTime().getNumericValue() - startTime));
    }

})(request, response);
