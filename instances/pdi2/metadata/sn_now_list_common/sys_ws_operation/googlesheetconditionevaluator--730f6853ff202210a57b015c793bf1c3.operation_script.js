(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var script = new global.ExportGoogleSheetConditionEvalutor();
	var result = script.isExportToSheetsVisible();

	response.setBody({result});

})(request, response);
