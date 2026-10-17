(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var script = new global.GoogleSheetListExport();
	var result = script.getTokenDetails();

	response.setBody({result});

})(request, response);
