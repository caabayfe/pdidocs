(function executeRule(current, previous /*null when async*/) {
	
	// Add your code here
	var tinyName=SNC.MetricScriptableApis.generateTinyName(current.metric_type);
	if(GlideStringUtil.nil(tinyName)){
		var message = gs.getMessage('Failed to get tiny metric name as other record is being inserted into sa_metric_type table simultaneously');
		gs.addErrorMessage(message);
		return;
	}
	current.metric_type_tiny_name = tinyName;
	
})(current, previous);
