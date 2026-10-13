(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var batch = request.body.data;
    var errorMsg = "";
	var error = new sn_ws_err.ServiceError();
	
	for(var i = 0 ; i< batch.length && JSUtil.nil(errorMsg); i++){
		var ciId = batch[i].ciSysId;
        var resId = batch[i].resourceId;

		if (JSUtil.nil(resId)){
			resId = "";
		}
				
		if(JSUtil.notNil(ciId) || JSUtil.notNil(resId)){
			var anomalyBatch = JSON.stringify(batch[i].anomaly_info_batch);
            var changeBatch = JSON.stringify(batch[i].change_info_batch);
			errorMsg = SNC.MetricScriptableApis.receiveAnomalyChangeEvents(ciId, resId, anomalyBatch, changeBatch);
		} else {
            errorMsg = "Empty identifiers received";
        }
	}
		
	if (JSUtil.notNil(errorMsg)){
		error.setStatus(400);
		error.setMessage(errorMsg);
		response.setError(error);
	}
	
})(request, response);
