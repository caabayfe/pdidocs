(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var requestBody = request.body.nextEntry();
	return new SoCStyleRule().serviceUpdateStyleRule(requestBody.chgSocDefId, requestBody.style, requestBody.records);
})(request, response);
