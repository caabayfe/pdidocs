(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var requestBody = request.body.nextEntry();
	return new SoCStyleRule().serviceDeleteStyleRule(requestBody.chgSocDefId, requestBody.style, requestBody.records);
})(request, response);
