(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var requestJSON = request.body.data;
    var snboqId = requestJSON['snboqId'] ? requestJSON['snboqId'] : "";

    if (snboqId === "") {
        response.setBody({
            message: "No SNBOQ ID passed in, add snboqId to request body"
        });
        response.setStatus(400);
    } else {
        try {
		    CloudRunnerAPI.TestGenerationAPI.cancelJob({snboqId: snboqId});
		    response.setBody({
                message: "success"
            });
		    response.setStatus(200);
	    } catch (e) {
		    response.setBody({
                message: e["message"]
            });
            response.setStatus(400);
	    }
    }

})(request, response);
