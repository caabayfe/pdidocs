(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const appRoute = apiHelper.getBodyParam(BuilderToolkitConstants.BODY_PARAM.APP_ROUTE, false);
		if(!appRoute){
			return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_APP_ROUTE);
		}
		apiHelper.getResponseGlideOperation(new AppRoute().updateRecord(appRoute),BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE);
	});

})(request, response);
