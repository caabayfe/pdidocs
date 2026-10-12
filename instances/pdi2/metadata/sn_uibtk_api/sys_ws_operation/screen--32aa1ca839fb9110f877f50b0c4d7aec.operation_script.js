(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
		const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
		apiHelper.getResponseGlideOperation(new Screen(noDomain).deleteRecord({sysId: sysId}), BuilderToolkitConstants.ERRORS.FAILED_TO_DELETE);
    });

})(request, response);
