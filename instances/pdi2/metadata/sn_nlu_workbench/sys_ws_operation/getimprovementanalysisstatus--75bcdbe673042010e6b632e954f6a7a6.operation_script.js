(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
        var result = new sn_nlu_workbench.NLUImprovementAnalysis().getStatus();
		if (result.status === 'success') {
			response.setStatus(200);
		} else {
			response.setStatus(400);
		}

		response.setContentType('application/json');
		return result;
	}
	catch (e) {
        return new sn_ws_err.BadRequestError(e.message);
    }

})(request, response);
