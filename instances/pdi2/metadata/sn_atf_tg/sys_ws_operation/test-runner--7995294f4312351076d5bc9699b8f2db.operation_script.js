(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var requestJSON = request.body.data;
    var testId = requestJSON['testId'] ? requestJSON['testId'] : "";

    if (testId === "") {
        response.setBody({
            message: "No Test ID passed in, add testId to request body"
        });
        response.setStatus(400);
    } else {

      try {
		    var returnedValue = CloudRunnerAPI.TestRunnerAPI.startJob({testId: testId});
		    response.setBody({snboqId: returnedValue});
		    response.setStatus(200);
	    } catch (e) {
		    response.setBody({
                message: e["message"]
            });
            response.setStatus(400);
	    }
    }

})(request, response);
