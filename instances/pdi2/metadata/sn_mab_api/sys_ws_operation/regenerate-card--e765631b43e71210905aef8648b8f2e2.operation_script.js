(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
		const { fullMobileMetadata } = request.body.data;
		return new WebToMobileComponentService().regenerateCard(fullMobileMetadata);
    } catch (error) {
		const customErrorHandler = new CustomErrorHandler(`REST API: ${request.uri}`);
		customErrorHandler.throwSnWsError(error);
    }
})(request, response);
