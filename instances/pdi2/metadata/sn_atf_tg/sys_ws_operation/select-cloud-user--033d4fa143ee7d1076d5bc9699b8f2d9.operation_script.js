(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var requestJSON = request.body.data;
    var username = requestJSON['username'] ? requestJSON['username'] : "";

	try {
		CloudRunnerAPI.TestUserAPI.selectCloudUser({username: username});
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

})(request, response);
