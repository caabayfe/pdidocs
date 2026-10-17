(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestJSON = request.queryParams;
    var snboqId = requestJSON['snboqId'] ? requestJSON['snboqId'] : "";

    if (snboqId === "") {
        response.setBody({
            message: "No SNBOQ ID passed in, add snboqId to request body"
        });
        response.setStatus(400);
    } else {
        try {
		    var returnedValue = CloudRunnerAPI.TestRunnerAPI.progress({snboqId: snboqId});
		    response.setBody(returnedValue);
		    response.setStatus(200);
	    } catch (e) {
		    response.setBody({
                message: e["message"]
            });
            response.setStatus(400);
	    }
    }

})(request, response);
