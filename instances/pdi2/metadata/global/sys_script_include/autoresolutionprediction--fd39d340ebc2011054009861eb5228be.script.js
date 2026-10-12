var AutoResolutionPrediction = Class.create();
AutoResolutionPrediction.prototype = {
	
	record: null,
	
    initialize: function(param) {
		if (typeof param === 'string') {
			// if the param is string, it's the sysId of the record
			this.record = new GlideRecord(AutoResolutionConstants.PREDICTION_TABLE_NAME);
			
			if (!this.record.get(param))
				throw 'Record not found';
		
		} else if (param instanceof GlideRecord) {
			this.record = param;
		}
	},
	
	/**
	* After the record was updated from outside, the method will fetch the same record from DB
	* After this call, the record will be up to date
	*/
	refresh: function() {
		this.initialize(this.record.getUniqueValue());
	},
	
	getSysId : function() {
		return this.record.getUniqueValue();
	},
	
	getARContextId : function() {
		return this.record.getValue('ar_context');
	},
	
	getUserId : function() {
		var context = this.record.ar_context;
		if (gs.nil(context)) 
			return null;
		
		var user = context.notification_user;
		return gs.nil(user) ? null : user.sys_id;
	},
	
	getSolutionName : function() {
		return this.record.getValue('solution_name');
	},
	
	getSchemaVersion : function() {
		return this.record.getValue('schema_version');
	},
	
	getTaskTableName : function() {
		return this.record.getValue('task_table');
	},
	
	getTaskId : function() {
		return this.record.getValue('task_id');
	},
	
	getExecutionTime : function() {
		return this.record.getValue('execution_time');
	},
	
	getStatusCode : function() {
		return this.record.getValue('status_code');
	},
	
	getStatusMessage : function() {
		return this.record.getValue('status_message');
	},
	
	getInputFields : function() {
		return this.record.getValue('input_fields');
	},
	
	getPredictedLanguage : function() {
		return this.record.getValue('predicted_language');
	},
	
	getPredictedCriticality : function() {
		return this.record.getValue('predicted_criticality');
	},
	
	getPredictedSearchQuery : function() {
		return this.record.getValue('predicted_search_query');
	},
	
	/**
	* Returns an array of prediction outputs
	* @param service : the specific service name. pass null to retrieve all available outputs
	* @return {Array[AutoResolutionPredictionOutput]}
	*/
	getPredictionOutputs : function(service) {
		
		var arr = [];
		
		var gr = new GlideRecord(global.AutoResolutionConstants.PREDICTION_OUTPUT_TABLE_NAME);
		gr.addQuery('prediction', this.getSysId());
		
		if (!gs.nil(service))
			gr.addQuery('service', service);
		
		gr.query();
		
		while(gr.next()) {
			var output = new global.AutoResolutionPredictionOutput(gr.getUniqueValue());
			arr.push(output);
		}
		return arr;
	},
	
	/**
	* Returns the prediction output found by the passed service name.
	* @param service
	* @return {AutoResolutionPredictionOutput} the found prediction output. null if not found.
	*/
	getPredictionOutputByService : function(service) {
	
		var arr = this.getPredictionOutputs(service);
		
		// make sure the length is >0 and take the first one.
		if(arr.length > 0) 
			return arr[0];
		
		// return null if not found.
		return null;
	},
	
	update : function() {
		this.record.update();
	},
	type: 'AutoResolutionPrediction'
};

/**
* Create a new Auto-Resolution prediction object
* 
* @param contextid: AR contextId
* @param solutionName
* @param languageXResult : the result from the LanguageX
* @param execTime : the execution time of LanguageX
*/

AutoResolutionPrediction.create = function(contextId, solutionName, languageXResult, execTime) {
	
	var gr = new GlideRecord(global.AutoResolutionConstants.PREDICTION_TABLE_NAME);
	
	gr.setValue('ar_context', contextId);
	gr.setValue('solution_name', solutionName);
	gr.setValue('execution_time', execTime);
	
	if (!gs.nil(languageXResult.status)) {
		gr.setValue('status_code', languageXResult.status.code);
		gr.setValue('status_message', languageXResult.status.message);
	}
	
	
	// when the result exists, 
	if (!gs.nil(languageXResult)) {
		
		gr.setValue('schema_version', languageXResult.schemaVersion);
	
		var result = languageXResult.result;
	
		if (!gs.nil(result) && result.length > 0 && !gs.nil(result[0].input))
			gr.setValue('input_fields', JSON.stringify(result[0].input.fields));
	}
	
	gr.insert();
	return new AutoResolutionPrediction(gr);
};
