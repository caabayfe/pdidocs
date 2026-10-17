function transform(input) {
	var result = {
		errors: [],
		showLoadButtons: false
	};
	var TABLE = "cmdb_multisource_query_status";
    var STATUS = "status";
	
	try {
		var executionId = input.executionId;
		if (!executionId || !executionId.length || !executionId[0]) {
			result.errors.push('executionId is missing.');
		}
		var gr = new GlideRecord(TABLE);
        if (gr.get(executionId)) {
            if (gr.getValue(STATUS) == "PAUSED") {
                result.showLoadButtons = true;
            }
        }
		
	} catch(error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
