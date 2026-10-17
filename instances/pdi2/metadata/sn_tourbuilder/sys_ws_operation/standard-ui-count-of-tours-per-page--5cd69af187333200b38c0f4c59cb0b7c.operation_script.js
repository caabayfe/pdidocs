(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var controller = new sn_tourbuilder.GTAutoLaunchController();
	var name = request.queryParams.name || '';
	var sort = request.queryParams.order || '';
	var data = controller.searchPagesByName({name: name, sort: sort});
	if(data && data.length) {
		response.setBody(data);
		response.setStatus(200);
	} else {
		response.setStatus(404);
	}

})(request, response);
