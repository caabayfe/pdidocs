(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var offset = isNaN(parseInt(request.queryParams.offset)) ? 0 : parseInt(request.queryParams.offset);
	var limit = isNaN(parseInt(request.queryParams.schedule_limit)) ? 40 : parseInt(request.queryParams.schedule_limit);
	var filter = (request.queryParams.filter && request.queryParams.filter !== "undefined") ? request.queryParams.filter + "" : "all";
	var orderBy = (request.queryParams.orderby && request.queryParams.orderby !== "undefined") ? request.queryParams.orderby + "" : "name";
	var textSearch = (!request.queryParams.text_search || request.queryParams.text_search === "undefined") ? "" : request.queryParams.text_search + "".trim();

	if (offset === -1)
		return new SoCLandingModelBuilder().initialHit(orderBy, textSearch);
	return new SoCLandingModelBuilder().getDefinitions(offset, limit, filter, orderBy, textSearch);
})(request, response);
