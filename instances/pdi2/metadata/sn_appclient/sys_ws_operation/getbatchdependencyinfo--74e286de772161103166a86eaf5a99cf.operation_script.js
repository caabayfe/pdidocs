(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var requestBody = appManagerApiUtil.getRequestBody();
        var requestData = requestBody.dependencies;
        var suiteInfo = requestBody.suiteInfo || {};
        var dependencyInfo = new DependencyProcessor(null, true).processBatchDependencies(requestData, suiteInfo);
        appManagerApiUtil.setResponseBody(dependencyInfo);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);
