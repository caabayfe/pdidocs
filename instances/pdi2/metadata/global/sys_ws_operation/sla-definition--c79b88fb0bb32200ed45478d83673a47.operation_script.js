(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	return new SLATimeLineV2().getSlaDefinitionDetail(request.pathParams.contractSlaIds);
})(request, response);
