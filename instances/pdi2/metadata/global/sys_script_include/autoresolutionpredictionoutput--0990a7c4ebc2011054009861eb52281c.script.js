var AutoResolutionPredictionOutput = Class.create();
AutoResolutionPredictionOutput.prototype = {
	
	record: null,
	
    initialize: function(param) {
		if (typeof param === 'string') {
			// if the param is string, it's the sysId of the record
			this.record = new GlideRecord(AutoResolutionConstants.PREDICTION_OUTPUT_TABLE_NAME);
			
			if (!this.record.get(param))
				throw 'Record not found';
		
		} else if (param instanceof GlideRecord) {
			this.record = param;
		}
	},
	
	/**
	* After the record was updated from outside, the method will fetch the same record from DB
	* After this call, the record will be up to date.
	*/
	refresh: function() {
		this.initialize(this.record.getUniqueValue());
	},
	
	getSysId : function() {
		return this.record.getUniqueValue();
	},
	
	getPrediction : function() {
		return this.record.prediction;
	},
	
	getService : function() {
		return this.record.getValue('service');
	},
	
	getOutput : function() {
		return this.record.getValue('output');
	},
	
	getScore : function() {
		return this.record.getValue('score');
	},
	
	getDetails : function() {
		return this.record.getValue('details');
	},
	
	/**
	* Returns the feedback value
	*/
	getFeedback: function() {
		return this.record.getValue('feedback_value');
	},
	
	/**
	* Checks if feedback can be submitted
	* @return true if yes.
	*/
	canSubmitFeedback : function() {
		return !this.isFeedbackSubmitted() && !this.isFeedbackProcessed();
	},
	
	/**
	* Returns the feedback status
	*/
	getFeedbackStatus : function() {
		return this.record.getValue('feedback_status');
	},
	
	/**
	* Tests if feedback is already submitted or not
	*/
	isFeedbackSubmitted : function() {
		return this.record.getValue('feedback_status') == global.AutoResolutionConstants.FEEDBACK_STATUS_SUBMITTED;
	},
	
	/**
	* Tests if feedback is already processed or not
	*/
	isFeedbackProcessed : function() {
		return this.record.getValue('feedback_status') == global.AutoResolutionConstants.FEEDBACK_STATUS_PROCESSED;
	},
	
	/**
	* Submits the feedback if allowed. 
	* If feedback is already submitted or processed, the feedback will be disregarded and thus, it won't be submitted
	*
	* @param the feedback to submit.
	*
	* @return true if succeeded or false if feedback is already submitted or processed
	*/
	submitFeedback : function(feedback) {

		// check if feedback can be submitted. If not return.
		if (!this.canSubmitFeedback())
			return false;
		
		// set the feedback value.
		this.record.setValue('feedback_value', feedback);
		
		// update the status.
		this.record.setValue('feedback_status', global.AutoResolutionConstants.FEEDBACK_STATUS_SUBMITTED);
		
		return true;
	},
	
	/**
	* Update the record
	*/
	update : function() {
		this.record.update();
	},
	
	type: 'AutoResolutionPredictionOutput'
};

/**
* Create a new Auto-Resolution prediction record
* 
* @param predictionSysId
* @param outputPayload the output line-item in the result from LanguageX
 * @return String sysId of the record inserted
*/
AutoResolutionPredictionOutput.create = function(predictionSysId, outputPayload) {
	
	var gr = new GlideRecord(AutoResolutionConstants.PREDICTION_OUTPUT_TABLE_NAME);
	gr.setValue('prediction', predictionSysId);
	
	gr.setValue('service', enforceEmptyStringIfNil(outputPayload.service));
	gr.setValue('output', enforceEmptyStringIfNil(outputPayload.serviceOutput));
	gr.setValue('score', enforceEmptyStringIfNil(outputPayload.serviceOutputScore));
	gr.setValue('service_model_used', enforceEmptyStringIfNil(outputPayload.serviceModelUsed));
	gr.setValue('service_model_solution_name', enforceEmptyStringIfNil(outputPayload.serviceModelSolutionName));
	gr.setValue('service_model_solution_version', enforceEmptyStringIfNil(outputPayload.serviceModelSolutionVersion));
	
	if (!gs.nil(outputPayload.serviceOutputDetails) && outputPayload.serviceOutputDetails.length > 0)
		gr.setValue('details', outputPayload.serviceOutputDetails);
	
	return gr.insert();
};

/**
 * Returns the value of the output field of the prediction output record, which contains nluIntent
 * returned from a LanguageX prediction
 * @param taskId - String id of a task GlideRecord
 * @return String name of the nluIntent
 */
AutoResolutionPredictionOutput.getNLUIntent = function(taskId) {
	// Get prediction record using task id first
	var predictionGr = new GlideRecord(AutoResolutionConstants.PREDICTION_TABLE_NAME);
	predictionGr.addQuery("task_id", taskId);
	predictionGr.query();
	predictionGr.next();
	var predictionId = predictionGr.getUniqueValue();
	
	// Get prediction output record using prediction id
	var outputGr = new GlideRecord(AutoResolutionConstants.PREDICTION_OUTPUT_TABLE_NAME);
	outputGr.addQuery("service", AutoResolutionConstants.AGENT_ZERO_SERVICE_NAME);
	outputGr.addQuery("prediction", predictionId);
	outputGr.query();
	outputGr.next();
	
	// Return the output field which is the nluIntent
	return outputGr.getValue("output");
};

AutoResolutionPredictionOutput.doesAgentZeroServiceOutputExist = function(predictionSysId) {
	var gr = new GlideRecord(AutoResolutionConstants.PREDICTION_OUTPUT_TABLE_NAME);
	gr.addQuery('prediction', predictionSysId);
	gr.addQuery('service', AutoResolutionConstants.AGENT_ZERO_SERVICE_NAME);
	gr.query();

	return gr.next();
};

function enforceEmptyStringIfNil(val) {
	return gs.nil(val) ? '' : val;
}
