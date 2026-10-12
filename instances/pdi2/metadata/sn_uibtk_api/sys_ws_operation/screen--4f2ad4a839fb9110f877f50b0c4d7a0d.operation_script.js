(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
		const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
        const {
            screen
        } = request.body.data;

		if(!screen){
			return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_SCREEN);
		}
		apiHelper.getResponseGlideOperation(new Screen([], noDomain).updateRecord(screen),BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE);
    });

})(request, response);
