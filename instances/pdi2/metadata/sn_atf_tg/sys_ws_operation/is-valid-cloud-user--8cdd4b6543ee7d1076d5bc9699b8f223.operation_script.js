(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var requestJSON = request.queryParams;
    var username = requestJSON['username'] ? requestJSON['username'] : "";

    response.setBody({
        validUser: CloudRunnerAPI.TestUserAPI.isValidCloudUser({
            username: username
        })
});

    response.setStatus(200);

})(request, response);
