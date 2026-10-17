(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var inputUsageJsonString = request.body.dataString;
	try{
		var parsedData = JSON.parse(inputUsageJsonString);
	} catch (ex) {
		gs.error('Error parsing request data ' + ex.message);
		response.setStatus(400);
		return;
	}

	if (!parsedData.usages) {
		response.setStatus(400);
		return;
	}

	try {
		var usageHandler = new ActivityPickerPAUsageHandler();
		if(usageHandler.reportUsage(parsedData)) {
			response.setStatus(200);
		} else {
			response.setStatus(500);
		}
	}
	catch (ex) {
		gs.error('Unable to report usage metrics ' + ex.message);
		response.setStatus(500);
	}
    
})(request, response);
