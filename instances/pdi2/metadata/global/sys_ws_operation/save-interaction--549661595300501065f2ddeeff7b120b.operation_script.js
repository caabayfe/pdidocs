(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var payload = request.body.data, snhelpUtil;
	var interactionController = new SNHelpGuidanceInteractionController();
	try {
		snhelpUtil = new SNHelpUtil();
		if(!snhelpUtil.isSnHelpEnabled())
			return snhelpUtil.snHelpDisabledError(response);

		var res = interactionController.update(request.pathParams.id, payload);

		response.setStatus(res.status);

		if(res.error)
			response.setBody({error: res.error});
		else
			response.setBody(res.data);

	} catch(e) {
		response.setStatus(500);
		gs.error("SNHelpService: (Save Interaction) - " + e.message);
		response.setBody({msg: "internal server error"});
	}

})(request, response);
