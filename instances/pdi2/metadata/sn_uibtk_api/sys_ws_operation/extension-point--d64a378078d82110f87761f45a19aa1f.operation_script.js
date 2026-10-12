(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const query = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.QUERY, false);
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID, false);
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN, false);
        const includeDisplay = !!sysId;
        const extensionPointHandler = new ExtensionPoint(null, noDomain, includeDisplay);
        const queryResult = sysId ? extensionPointHandler.getExtensionPoint(sysId) : extensionPointHandler.getExtensionPoints(query);
        apiHelper.getResponse(queryResult, BuilderToolkitConstants.ERRORS.NO_COMPONENT_DEFINITIONS);
    });

})(request, response);
