(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const customErrorHandler = new CustomErrorHandler(`REST API: ${request.uri}`);

    try {
		let fullMobileMetadata = request.body.data.fullMobileMetadata;  
		if (typeof fullMobileMetadata === 'string') {  
			fullMobileMetadata = JSON.parse(fullMobileMetadata);  
		}
		return new CreateMobileComponentService().createComponent(fullMobileMetadata);
    } catch (error) {
        customErrorHandler.throwSnWsError(error);
    }
})(request, response);
