(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    let packageIds = request.queryParams?.packageIds[0] ? request.queryParams.packageIds[0] : null;

    let configurationHubUtil = new ConfigurationHubUtil();
    let sources = configurationHubUtil.getPackageSources(packageIds);

    result = {
        sources
    };

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
