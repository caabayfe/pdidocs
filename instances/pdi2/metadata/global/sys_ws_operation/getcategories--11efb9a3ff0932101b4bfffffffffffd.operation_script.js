(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var restrict = (!request.queryParams.restrict || request.queryParams.restrict === "undefined") ? "" : request.queryParams.restrict + "".trim();

	return new CreateChangeLanding().getCategories(restrict);
})(request, response);
