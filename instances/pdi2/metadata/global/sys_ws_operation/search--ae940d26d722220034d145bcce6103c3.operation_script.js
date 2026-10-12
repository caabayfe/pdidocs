(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var qp = request.queryParams;
	var searchRequest = new SNC.SearchRequest();
	var payload = request.body.data;

	// If there's no payload and no query parameter we can return an error.
	if (JSUtil.isEmpty(payload) && JSUtil.nil(qp.q))
		return new sn_ws_err.BadRequestError("No Query String provided"); 
	
	// Create the request from the payload
	if (!JSUtil.isEmpty(payload))
		searchRequest.fromJSON(new JSON().encode(payload));
	
	if (JSUtil.notNil(qp.q))
		searchRequest.query.freetext = qp.q;
	
	if (JSUtil.notNil(qp.cx))
		searchRequest.context = qp.cx;
	
	if (JSUtil.notNil(qp.start) && !isNaN(qp.start)) {
		var winDiff = searchRequest.meta.window.end - searchRequest.window.start;
		var start = parseInt(qp.start);
		searchRequest.meta.window.start = start;
		searchRequest.meta.window.end = start + winDiff;
	}
	
	if (JSUtil.notNil(qp.num) && !isNaN(qp.num))
		searchRequest.meta.window.end = searchRequest.meta.window.start + parseInt(qp.num);
	
	var searchResponse = searchRequest.submit();
	response.setBody(new JSON().decode(searchResponse.toJSON()));
})(request, response);
