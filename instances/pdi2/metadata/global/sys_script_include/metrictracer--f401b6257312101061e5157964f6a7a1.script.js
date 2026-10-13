var MetricTracer = Class.create();
MetricTracer.prototype = {
    initialize: function() {
    },
	// Check input's validity then set metric tracer info
	setMetricInfo: function(midSysId, node, ciSysId, metricTypeSysId, resource){
		var resourceId = this.getResourceId(resource,ciSysId);
		if (resourceId == "")
			resource = "";
		if (!this.checkValidity(midSysId, node, ciSysId, metricTypeSysId))
			return;
		this.setMetricInfoParameters(midSysId, node, ciSysId, metricTypeSysId, resource, resourceId);
	},
	
	// Set metric tracer fields on the MID side and instance side
	setMetricInfoParameters: function(midSysId, node, ciSysId, metricTypeSysId, resource, resourceId){
		var metricType = this.getMetricType(metricTypeSysId);
		var metricTinyName = this.getMetricTinyName(metricTypeSysId);
		var midConfigParamToValue = {  "em.metric.tracer.ciSysId": ciSysId,
									"em.metric.tracer.node": node,
									"em.metric.tracer.metricType": metricType,
									"em.metric.tracer.metricTypeSysId": metricTypeSysId,
									"em.metric.tracer.resource": resource,
									"em.metric.tracer.resourceId": resourceId };
		var metricAPIs = new SNC.MetricScriptableApis();
		metricAPIs.initMetricTracer(node, ciSysId, metricType, metricTypeSysId, metricTinyName, resource, resourceId);
		this.setMidConfigParams(midConfigParamToValue, midSysId);
		if (midSysId == "" || ciSysId == "" || node == "")
			return;
		var timeToLookBackForMetrics = 10;
		if (resourceId == "")
			this.printMetricDataForAllResources(ciSysId, metricTypeSysId);
		else
			gs.info("MetricTracer: "+this.printMetricDataByCIAndMetric(ciSysId, metricTypeSysId, timeToLookBackForMetrics, resourceId));
	},
	
	// Set MID config parameters for the metric tracer
	setMidConfigParams: function(configParamToValue, midSysId){
		for(var key in configParamToValue){
			if (configParamToValue.hasOwnProperty(key)){
				var gr = new GlideRecord("ecc_agent_config");
				gr.addQuery("ecc_agent", midSysId);
				gr.addQuery("param_name", key);
				gr.query();
				if (gr.next()){
					gs.info("MetricTracer: updated mid config param "+key);
					gr.setValue("value", configParamToValue[key]);
					gr.update();
				}
				else{
					gs.info("MetricTracer: added mid config param "+key);
					gr.setValue("ecc_agent", midSysId);
					gr.setValue("param_name", key);
					gr.setValue("value", configParamToValue[key]);
					gr.insert();
				}
			}
		}
	},
	
	getResourceId: function(resourceName, ciId){
		var resourceId = "";
		var gr = new GlideRecord("ci_resource");
		gr.addQuery("name", resourceName);
		gr.addQuery("cmdb_ci", ciId);
		gr.query();
		if(gr.next())
			resourceId = gr.getUniqueValue();
		else
			gs.info("MetricTracer: Wrong resource name, bringing data for all resources. Please insert a valid resource name if you want to trace a specific resource.");
		return resourceId;
	},
	
	getMetricType: function(metricTypeSysId){
		var gr = new GlideRecord("sa_metric_type");
		if (gr.get("sys_id", metricTypeSysId))
			return gr.getValue("metric_type");
		return "";
	},
	
	getMetricTinyName: function(metricTypeSysId){
		var gr = new GlideRecord("sa_metric_type");
		if (gr.get("sys_id", metricTypeSysId))
			return gr.getValue("metric_type_tiny_name");
		return "";
	},
	
	getStartDate: function(hrs) {
		var startDate = new GlideDateTime();
		var hours = 60 * 60 * hrs;
		startDate.addSeconds(-hours);
		return startDate;
	},
	
	// Get resource glide record according to the table/sysClassName it belongs to
	getResGr: function(resourceId, sysClassName, ciGr) {
		var resGr;
		if (resourceId == "") {
			resGr = new GlideRecord(sysClassName);
			resGr.addQuery('sys_id', ciGr.getValue("sys_id"));
		} else {
			var ciResGr = new GlideRecord("ci_resource");
			ciResGr.addQuery('sys_id', resourceId);
			ciResGr.query();
			if (ciResGr.next())
				sysClassName = ciResGr.getValue("sys_class_name");
		
			resGr = new GlideRecord(sysClassName);
			resGr.addQuery('sys_id', resourceId);
		}
		return resGr;
	},
	
	// gets metric data points reaching clotho for the selected metric
	getTransformMetricData: function(resourceGr, metricName, ciName, startTime, endTime) {
		var transformer = new sn_clotho.Transformer(resourceGr);
		transformer.metric(metricName).avg().label("Average");
		var res = transformer.execute(startTime, endTime);
		if (!res.getData()) {
			gs.info("MetricTracer: The metric "+metricName+", "+ciName+" did not reach Clotho successfully");
			return;
		}
		var values = res.getData().getValues();
		var timestamp = res.getData().getStart().getNumericValue();
		var period = res.getData().getPeriod() * 1000;
		var innerDataSet = '{"target":"' + metricName + '", "datapoints": [';
		for (var j = 0; j < values.length; j++) {
			// [100,1593283865000],
			if (values[j])
				innerDataSet += '[' + values[j] + ',' + timestamp + '],';
			timestamp += period;
		}
		// remove the last ',' if datapoints not empty
		if (innerDataSet[innerDataSet.length - 1] == ",")
			innerDataSet = innerDataSet.substring(0, innerDataSet.length - 1);
		innerDataSet += ']}';
		return innerDataSet;
	},
	
	// prints the metric data points reaching clotho for the selected metric
	printMetricDataByCIAndMetric: function(ciId, metricTypeId, hrs, resourceId) {
		var startDate = this.getStartDate(hrs);
		var endDate = new GlideDateTime();
		var metricName = this.getMetricTinyName(metricTypeId);
		/*To get the ci name and ci type from cmdb_ci table */
		var gr = new GlideRecord('cmdb_ci');
		gr.get(ciId);
		gr.query();
		if (gr.next()) {
			var ciName = gr.getValue("name");
			var sysClassName = gr.getValue("sys_class_name");
			//this.printFstSection(startDate, endDate, ciName, sysClassName);
			var resourceGr = this.getResGr(resourceId, sysClassName, gr);
			resourceGr.query();
			if (resourceGr.next()) {
				var resourceName = resourceGr.getValue("name");
				var dataSet = '[';
				dataSet += this.getTransformMetricData(resourceGr, metricName, ciName, startDate, endDate);
				dataSet += ']';
				return dataSet;
			}
		}
		return "No data found in clotho";
	},
	
	// if no resource is given, print metric data points in clotho for all resources
	printMetricDataForAllResources: function(ciSysId, metricTypeSysId){
		var timeToLookBackForMetrics = 10;
		var gr = new GlideRecord("sa_metric_map");
		gr.addQuery("cmdb_ci", ciSysId);
		gr.addQuery("metric_type_id", metricTypeSysId);
		gr.query();
		while(gr.next())
			gs.info("MetricTracer: "+gr.getValue("resource_id")+": "+this.printMetricDataByCIAndMetric(ciSysId, metricTypeSysId, timeToLookBackForMetrics, gr.getValue("resource_id")));
	},
	
	checkValidity: function(midSysId, node, ciSysId, metricTypeSysId){
		var valid = true;
		if (!this.checkValidtyByTable("cmdb_ci", ciSysId)){
			gs.error("MetricTracer: Wrong CI sys_id");
			valid = false;
		}
		if (!this.checkValidtyByTable("sa_metric_type", metricTypeSysId)){
			gs.error("MetricTracer: Wrong metric type sys_id");
			valid = false;
		}
		if (!this.checkValidtyByTable("ecc_agent", midSysId)){
			gs.error("MetricTracer: Wrong MID server sys_id");
			valid = false;
		}
		return valid;
	},
	
	checkValidtyByTable: function(table, sysId){
		var gr = new GlideRecord(table);
		gr.addQuery("sys_id", sysId);
		gr.query();
		if (gr.next())
			return true;
		return false;
	},
	
	resetTracer: function(midSysId){
		this.setMetricInfoParameters(midSysId, "", "", "", "", "");
	},
	
    type: 'MetricTracer'
};
