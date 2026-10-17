(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var args = appManagerApiUtil.getRequestParams();
        var sourceAppId = args.queryParams['source_app_id'] || "";
        var version = args.queryParams['version'] || "";
        var manifest = new ManifestService().getManifestForAppVersionSysId(sourceAppId, version);
        appManagerApiUtil.setResponseBody(manifest);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);
