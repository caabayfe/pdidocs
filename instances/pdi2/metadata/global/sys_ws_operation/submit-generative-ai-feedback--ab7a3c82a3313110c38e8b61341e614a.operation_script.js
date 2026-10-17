(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var reqJson = JSON.parse(request.body.dataString);
    var resp = new sn_generative_ai.GenerativeAIUtil().sendFeedback(reqJson);
    if (resp["status"] != "success") {
        response.setStatus(500);
    } else {
        response.setStatus(200);
    }
	return resp;
})(request, response);
