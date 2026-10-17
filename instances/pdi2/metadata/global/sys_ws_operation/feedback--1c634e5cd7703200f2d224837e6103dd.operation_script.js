(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payload = request.body.data;

	// If there's no payload and no query parameter we can return an error.
	if (JSUtil.isEmpty(payload))
		return new sn_ws_err.BadRequestError("No Query String provided");

	var json = new JSON();
	var feedbackRequest = new SNC.FeedbackRequest().fromJSON(json.encode(payload));
	var feedbackResponse = feedbackRequest.submit();
	response.setBody(json.decode(feedbackResponse.toJSON()));
})(request, response);
