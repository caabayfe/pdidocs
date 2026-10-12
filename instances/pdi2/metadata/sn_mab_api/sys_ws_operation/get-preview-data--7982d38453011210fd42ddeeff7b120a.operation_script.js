(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var sampleSize = request.body.data.sampleSize;
    var table = request.body.data.table;
    var fields = request.body.data.fields;
	var condition = request.body.data.condition;
	var listItemConfigs = request.body.data.listItemConfigObjects;

    const previewData = new ListItemPreviewDataService().getPreviewData(table, fields, condition, sampleSize, listItemConfigs);

    return {
        "previewData": previewData
    };

})(request, response);
