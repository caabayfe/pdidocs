var AnomalyMetricData = Class.create();
AnomalyMetricData.prototype = {
    initialize: function() {
    },
	getAllData: function(alertId, start, end){
		
		var finalMsg = {};
		var additionalInfo = "";
		var metricValue = "";
		var metricTypeId = "";
		var sourceMetricType = "";
		var resourceId = "";
		var lowerBound = "";
		var upperBound = "";
		var anomalyMsg = "";
		var ciSysId = "";
		var metricData = "";
		var expected = "";
		
		// Get info from the alert
		var gr = new GlideRecord("em_alert");
		gr.addQuery('sys_id',alertId);
		gr.query();
		if(gr.next()){
			additionalMsg = gr.getValue('additional_info');
			anomalyMsg = gr.getValue('description');
			ciSysId = gr.getValue('cmdb_ci');
		}
		
		// Get info from 'additional info'
		additionalInfo = JSON.parse(additionalMsg);
		for(var key in additionalInfo){
			if(key == "metric_value")
				metricValue = String(additionalInfo[key]);
			if(key == "metric_type_id")
				metricTypeId = String(additionalInfo[key]);
			if(key == "metric_lower_bound")
				lowerBound = additionalInfo[key];
			if(key == "metric_upper_bound")
				upperBound = additionalInfo[key];
			if(key == "source_metric_type")
				sourceMetricType = additionalInfo[key];
			if(key == "resource_id")
				resourceId = additionalInfo[key];
		}
		// Get metric data
		metricData = this.getMetricData(ciSysId, start, end, metricTypeId, resourceId);
		
		// Find the expected value
		if(metricValue >= upperBound){
			expected = upperBound;
		}
		if(metricValue <= lowerBound){
			expected = lowerBound;
		}
		
		finalMsg = this.setFinalMsg(anomalyMsg, metricValue, sourceMetricType, expected, metricData);
		return finalMsg;
	},
	getMetricData: function(ciSysId, start, end, typeSysId, resourceId){
		var startTime = start.getNumericValue();
		var endTime = end.getNumericValue();
		var metricData = new SNC.MetricScriptableApis().getMetricData(ciSysId, startTime, endTime, typeSysId, resourceId);
		return metricData;
	},
		
	setFinalMsg: function(anomalyMsg, metricValue, sourceMetricType, expected, metricData){
		
		var finalMsg = {};
		finalMsg = {
			"result": {
				"tooltip": anomalyMsg,
				"count": {
					"value": metricValue,
					"type": sourceMetricType,
				},
				"expected": {
					"value": expected,
					"type": "expected"
				},
				"metrics": JSON.parse(metricData)
			}
		};
		return finalMsg;
	},
	
    type: 'AnomalyMetricData'
};
