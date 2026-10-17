(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var displayMessage = "";

	if (!request.pathParams.id) {
		displayMessage = gs.getMessage("Cannot process the request because the error code id is not present");
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}
	if (!request.body.data) {
		displayMessage = gs.getMessage("Cannot process the request because the data is not present");
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	var errorCodeId = request.pathParams.id;
	var data = request.body.data;

	var errorCodeGr = new GlideRecord("automation_error_code");
	errorCodeGr.get(errorCodeId);

	if (errorCodeGr.isValidRecord()){
		errorCodeGr.setValue('comment',data.comment);
		errorCodeGr.update();
		response.setStatus(200);
		response.setContentType("application/json");
		response.setBody({"success" : true, "comment" : data.comment });
	} else {
		displayMessage = gs.getMessage("Cannot process the request because the error code id does not have a valid record");
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}
})(request, response);
