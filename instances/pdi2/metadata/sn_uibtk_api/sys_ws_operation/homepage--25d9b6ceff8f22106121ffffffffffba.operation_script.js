(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {

        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
		const homepageHandler = new Homepage(noDomain);
        apiHelper.respondSuccesfully(homepageHandler.get());
    });

})(request, response);
