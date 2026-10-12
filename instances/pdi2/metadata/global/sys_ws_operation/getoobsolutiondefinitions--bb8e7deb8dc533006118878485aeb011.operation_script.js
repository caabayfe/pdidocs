(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var trainer = decodeURI(request.pathParams.trainer);
	if (trainer) {
		return new MLSolutionDefinitionUtils().getDefaultOOBSolutionDefinitions(trainer);
	} else {
		return sn_ws_err.BadRequestError("Trainer not present");
	}

})(request, response);
