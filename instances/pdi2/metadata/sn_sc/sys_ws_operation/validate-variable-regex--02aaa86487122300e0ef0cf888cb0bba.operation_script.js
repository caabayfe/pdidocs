(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var requestBody = request.body.nextEntry();
	var isPreview = requestBody["isPreview"];
	if (isPreview == true) {
		var value = requestBody["sysparm_value"];
		var regexId = requestBody["sysparm_regexId"];
		if (global.JSUtil.notNil(value) && global.JSUtil.notNil(regexId)) 
			return GlideappQuestion.validateRegexForValue(regexId, value);
		
		return true;		
	}
    var questionId = request.pathParams.sys_id;
	if (!questionId)
		throw new sn_ws_err.BadRequestError("SYS_ID should be provided as path param.");
	
	var questionValue = requestBody["sysparm_value"];
	if (!questionValue) {
		throw new sn_ws_err.BadRequestError("Question value should be provided as request body.");
	}
	
	var question = GlideappQuestion.getQuestion(questionId);
	if (!question.validateRegex(questionValue)) {
		var error_response = {};
		response.setStatus(400);
		error_response.errMsg = "Validation error: " + question.getValidationMessage();
		return error_response;
	} else
		return true;

})(request, response);
