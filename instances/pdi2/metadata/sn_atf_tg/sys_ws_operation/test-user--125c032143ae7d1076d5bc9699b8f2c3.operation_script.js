(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var requestJSON = request.body.data;
    var username = requestJSON['username'] ? requestJSON['username'] : "";

    try {
		var returnedValue = CloudRunnerAPI.TestUserAPI.startJob({username: username});
		response.setBody({
			snboqId: returnedValue
		});
		response.setStatus(200);
	} catch (e) {
		response.setBody({
            message: e["message"]
        });
        response.setStatus(400);
	}

})(request, response);
