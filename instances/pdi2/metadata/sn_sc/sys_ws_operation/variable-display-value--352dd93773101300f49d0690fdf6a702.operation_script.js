(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var questionId = request.pathParams.sys_id;
	if (!questionId)
		throw new sn_ws_err.BadRequestError("SYS_ID should be provided as path param.");
	
	var requestBody = request.body.nextEntry();
	var questionValue = requestBody["sysparm_value"];
	if (!questionValue) {
		throw new sn_ws_err.BadRequestError("Question value should be provided as request body.");
	}
	return new global.VariableUtil().getDisplayValue(questionId, questionValue);
})(request, response);
