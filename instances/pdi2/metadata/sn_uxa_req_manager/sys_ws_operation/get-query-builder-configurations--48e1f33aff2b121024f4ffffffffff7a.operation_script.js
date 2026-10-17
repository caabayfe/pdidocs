(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const {
            appSysId,
            componentId
        } = request.queryParams;
        response.setBody(new UXAQueryBuilderConfigurationService().getQueryBuilderConfigurations(appSysId[0] || null, componentId[0] || null));
    } catch {
        response.setStatus(200);
        response.setBody([]);
    }
})(request, response);
