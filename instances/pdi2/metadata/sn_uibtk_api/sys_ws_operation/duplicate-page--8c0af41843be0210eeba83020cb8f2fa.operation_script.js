(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    const noDomain = apiHelper.getQueryParam('noDomain');
    const experienceId = apiHelper.getQueryParam('experienceId');
    const mode = apiHelper.getQueryParam('mode');
    apiHelper.execute(function() {
        const {
			screenCollectionId,
            screen,
			route
        } = request.body.data;
        const result = new Page(noDomain).duplicate(
			screenCollectionId,
            screen,
			route
        );
        typeof result === 'string' ? apiHelper.respondUnsuccessfully(result) : apiHelper.respondSuccesfully(result);
    });
})(request, response);
