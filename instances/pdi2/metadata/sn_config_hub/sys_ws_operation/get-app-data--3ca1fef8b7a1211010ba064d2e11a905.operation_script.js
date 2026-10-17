(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const configurationHubUtil = new ConfigurationHubUtil();
    let result = {
        applications: configurationHubUtil.getInstalledApplications()
    };
    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);
})(request, response);
