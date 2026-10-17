(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var message;
	
	var uploadData =request.body.data;
	
	var sysId = uploadData.sysId;
	var entityType = uploadData.entityType;
	var tableName = uploadData.tableName;
	var validRecords = uploadData.validRecords;
	
	var result = new RecipientListUploadProcessor().uploadRecords(sysId, entityType, tableName, validRecords);
	return result;
		
	})(request, response);
