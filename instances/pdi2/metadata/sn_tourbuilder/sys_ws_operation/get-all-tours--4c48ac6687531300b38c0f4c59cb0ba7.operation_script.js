(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

var controller = new sn_tourbuilder.GTAutoLaunchController();
var result = controller.getTours(request.queryParams);
if (result) {
	if (result.success) {
		response.setBody(result.payload);
		response.setStatus(200);
	} else {
		var body = result.payload ? result.payload : {msg: 'BAD_REQUEST'};
		response.setBody(body);
		if (result.reason === 'BAD_REQUEST') response.setStatus(400);
		else response.setStatus(500);
	}
} else {
	response.setStatus(500);
}

})(request, response);
