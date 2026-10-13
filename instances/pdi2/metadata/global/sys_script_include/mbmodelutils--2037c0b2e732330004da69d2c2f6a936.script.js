var MBModelUtils = Class.create();
MBModelUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isPublic:function(){return true;},
	
	/**
	 * Converts time from UTC to ISO UTC
	 * "yyyy-MM-dd HH:mm:ss.SSS" -> "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
	 */
	getISOUTCfromUTC:function(timeSTR) {
		var dateTime = timeSTR.split(" ");
		return dateTime[0] + "T" + dateTime[1] + "Z";
	},
 
	computeTransformString:function() {
		var modelParams = this.getParameter('model_string');
		var currentRecordID = this.getParameter('current_id');
						
		var currentRecord = new GlideRecord('mb_model_instance');
		var currentRecordFound = currentRecord.get(currentRecordID);
				
		// Query records
		var records = new GlideRecord(currentRecord.mb_model.metric_table);
		records.addEncodedQuery(currentRecord.mb_model.filter);
		records.setLimit(10);
		if (Object.keys(currentRecord.mb_model.group_by).length > 0) 
			records.addQuery(currentRecord.mb_model.group_by, currentRecord.group_name);
				
		records.query();
		
		var model = new sn_clotho.Data.fromModelString(modelParams);
		var paramErrors = new sn_clotho.Data.validateModelParams(model);
		if (paramErrors.length > 0) {
			var errorString = paramErrors[0];
			for(var i = 1; i < paramErrors.length; i++)
				errorString += '<BR>' + paramErrors[i];

			gs.addErrorMessage(errorString);
			return;
		}
		
		var builder = new sn_clotho.Transformer(records);
		builder.metric(currentRecord.mb_model.metric.element).avg()
			.predict(model).decompose([]);
		
		builder.metric(currentRecord.mb_model.metric.element).label("Data").avg();
				
		var start = new GlideDateTime(currentRecord.mb_model.start);
		var end = new GlideDateTime(currentRecord.mb_model.end);
						
		// Return transform string
		var transformString = JSON.stringify({
			query_condition: records.getEncodedQuery(),
			transforms: [{
				input: {
					transform: "Reference",
					name: "chart-subjects"
				},
				transform: JSON.parse(builder.toJson(start, end)),
				metric: currentRecord.mb_model.metric.element.toString()
			}],
			group_by: "",
			table: currentRecord.mb_model.metric_table.toString()
		});
						
		// Metric Chart Data Generator requires iso utc time. 
		startTime = this.getISOUTCfromUTC(start.getUTCValue());
		endTime = this.getISOUTCfromUTC(end.getUTCValue());
		
		var params = {
				sysparm_title: currentRecord.name.toString(),
				sysparm_type: "line",
				sysparm_table: currentRecord.mb_model.metric_table.toString(),
				sysparm_source_type: "metricbase",
				sysparm_custom_config: transformString,
				sysparm_start_time: startTime,
				sysparm_end_time: endTime,
				sysparm_show_marker: false
			};
		
		var result = this.newItem("result");
		result.setAttribute("params", JSON.stringify(params));
		result.setAttribute("newModelString", model.toModelString());
	},
	
    type: 'MBModelUtils'
});
