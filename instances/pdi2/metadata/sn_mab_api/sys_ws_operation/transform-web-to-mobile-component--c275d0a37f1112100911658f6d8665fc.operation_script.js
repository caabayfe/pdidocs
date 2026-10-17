(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
		const {source} = request.pathParams;
		const options = request.body.data;
		return new WebToMobileComponentService().transform(source, options);
    } catch (error) {
		const customErrorHandler = new CustomErrorHandler(`REST API: ${request.uri}`);
		customErrorHandler.throwSnWsError(error);
    }
})(request, response);
