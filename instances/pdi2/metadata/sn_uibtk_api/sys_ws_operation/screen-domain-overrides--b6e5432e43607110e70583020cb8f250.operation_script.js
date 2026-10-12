(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID, null);

        const result = new Screen(['sys_domain,sys_override'], true).getScreenOverrides(sysId);
        apiHelper.respondSuccesfully(result);
    });
})(request, response);
