(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const versionIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.VERSION_IDS);
        const versionsPayload = new VersionsHandler().parseVersions(versionIds);
        apiHelper.respondSuccesfully(versionsPayload);
    });

})(request, response);
