(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var request_data = request.body.data;	
	var insertedRecords = BulkRecordInsertProcessor.insertRecords(request_data.tableName, request_data.records);
	
	var results = {};
	results['Mass Rest Insert'] =  insertedRecords + " record were inserted";
	return results;
	
})(request, response);
