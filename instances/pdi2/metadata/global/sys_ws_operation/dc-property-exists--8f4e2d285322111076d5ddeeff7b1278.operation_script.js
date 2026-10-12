(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var dcPropertyExists = !gs.nil(gs.getProperty("glide.customurl.datacenter.instance.password"));
	response.setBody({
		dcPropertyExists: dcPropertyExists
	});
	response.setStatus(200);

})(request, response);
