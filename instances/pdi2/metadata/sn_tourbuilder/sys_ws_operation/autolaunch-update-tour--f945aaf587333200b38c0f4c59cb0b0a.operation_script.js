(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var controller = new sn_tourbuilder.GTAutoLaunchController();
	var data = request.body.data;
	if (!data || !(data.autolaunchOff instanceof Array) || !(data.autolaunchOn instanceof Array) ) {
		response.setBody({msg: 'Invalid Data'});
		response.setStatus(400);
	} else {
		data.resetUserPreferences = data.resetUserPreferences || false;
		var res = controller.updateToursForPage(data);
		response.setBody(res);
		response.setStatus(200);
	} 

})(request, response);
