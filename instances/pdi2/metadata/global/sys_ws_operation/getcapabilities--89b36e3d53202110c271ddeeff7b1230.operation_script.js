(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // Enforce capability metadata read authorization before using the DAO-backed read path.
    if (!sn_one_extend.OneExtendUtil.canReadOneExtendMetadata('capability')) {
        response.setStatus(403);
        response.setBody({ error: 'Access denied: user is not authorized to read One Extend capability metadata' });
        return;
    }

    // Get buildername from path param
    var pathParams = request.pathParams;
    var builderName = pathParams.builderName;

    // Get all queryParams 
    var queryParams = request.queryParams;
    var queryMap = {};
    if (queryParams !== null) {
        var params = JSON.parse(JSON.stringify(queryParams));
        for (var key in params) {
            queryMap[key] = params[key][0];
        }
    }

    var responseBody = sn_one_extend.OneExtendUtil.getAllCapabilities(builderName, queryMap);
    response.setBody(responseBody);

})(request, response);
