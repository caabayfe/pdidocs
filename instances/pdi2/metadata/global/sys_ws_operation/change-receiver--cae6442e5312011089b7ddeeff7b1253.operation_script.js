(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var batch = request.body.data;
	var body = {};
	
	for (var a = 0; a < batch.length; a++){
		var change = JSON.stringify(batch[a]);
		var error = SNC.MetricScriptableApis.receiveChangeScores(change);	
	}
	body.error = error;
	
	response.setBody(body); 

})(request, response);
