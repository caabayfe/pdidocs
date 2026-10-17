(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var payload = request.body.data;	
	
	// If there's no payload and no query parameter we can return an error.
	if (global.JSUtil.isEmpty(payload))
		return new sn_ws_err.BadRequestError("No Query String provided");

	if (payload.blockcontext && payload.pageid) {		

		var acePageGr = new GlideRecord("sn_ace_page");
		if(acePageGr.get(payload.pageid)) {
			acePageGr.client_context = JSON.stringify(payload.blockcontext);
			acePageGr.update();
		}
	}
	response.setBody({status: "success"});
})(request, response);
