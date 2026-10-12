(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const extensionPointSysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.EXTENSION_POINT_SYS_ID);
		const experienceList = new Screen().getExperiencesForExtensionPoint(extensionPointSysId);
		apiHelper.getResponse({experiences:experienceList},BuilderToolkitConstants.ERRORS.NO_EXPERIENCE_FOUND);
	});
})(request, response);
