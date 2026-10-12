(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var qp = request.queryParams;
    var searchRequest = new SNC.SearchRequest();
	
	if (JSUtil.nil(qp.q))
		return new sn_ws_err.BadRequestError("No Query String provided");
	
	searchRequest.query.freetext = qp.q;
	
	if (JSUtil.notNil(qp.cx))
		searchRequest.context = qp.cx;
	
	if (JSUtil.notNil(qp.start) && !isNaN(qp.start))
		searchRequest.meta.window.start = parseInt(qp.start);
	
	if (JSUtil.notNil(qp.num) && !isNaN(qp.num))
		searchRequest.meta.window.end = searchRequest.meta.window.start + parseInt(qp.num);
	
	var searchResponse = searchRequest.submit();

	// Have to encode then decode as SearchService was written before new Rhino
	response.setBody(new JSON().decode(searchResponse.toJSON()));

})(request, response);
