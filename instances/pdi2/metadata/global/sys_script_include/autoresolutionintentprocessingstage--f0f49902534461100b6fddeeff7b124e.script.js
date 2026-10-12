var AutoResolutionIntentProcessingStage = Class.create();
AutoResolutionIntentProcessingStage.prototype = Object.extendsObject(AutoResolutionTaskProcessingStage, {

	/**
	 * Provides a way to determine the current task processing stage in the auto resolution flow
	 * @return {string} name of the current auto resolution stage
	 */
	getStateValue: function() {
		return AutoResolutionConstants.TASK_PROCESSING_STATE.INTENT_PROCESSING;
	},
	
	/**
	 * Executes the current stage
	 * @return {StageResponse} object that passes along information to the next stage
	 */
	execute: function(contextFieldValueMap) {
		this.prepare(contextFieldValueMap, this.type);

		// Exit this stage early if the stage is not supported
		if(!this._shouldStageContinue())
			return this.response;

		// Set context values
		this._setMLSolutionValuesOnContextRecord();
		this._setIntentAndTopicValuesOnContextRecord();

		return this.response;
	},

	/**
	 * Sets the values related to the ML solution on the context record
	 * @return {void}
	 */
	_setMLSolutionValuesOnContextRecord: function() {
		// Get the solution name and version that will be used for AZ prediction
		var solutionInfo = AutoResolutionLanguageHelper.getSolutionNameAndVersionForLanguage(this.configId, this.languageCode);

		// Empty or null check is not required on results because we have done all the validations and an active language config record should exist for the give config and language code
		this.setContextValue("ml_solution_name", solutionInfo.solution_name);
		this.setContextValue("ml_solution_version", solutionInfo.solution_version);
	},

	/**
	 * Sets the values related to the intent and topic details on the context record
	 * @return {void}
	 */
	_setIntentAndTopicValuesOnContextRecord: function() {
		var intent = AutoResolutionPredictionOutput.getNLUIntent(this.taskId);
		var intentAndTopicDetails = new AutoResolutionPredictionHelper(this.configId, this.userId).processIntent(intent);

		// Set context values for intent and topic
		this.setContextValue('nlu_intent', intentAndTopicDetails.nluIntent);
		this.setContextValue('matched_topic', intentAndTopicDetails.matchedTopic);
		this.setContextValue('intent_topic_state', intentAndTopicDetails.intentTopicState);
		var contextReason = gs.nil(intent)
			? AutoResolutionConstants.NO_INTENT_REASON['API_ERROR']
			: intentAndTopicDetails.intentTopicStateReason;
		this.setContextReason(contextReason);
		
		// actually update matched_topic in context for mail_script:getIARMatchedTopicName to be able to get it
		this.contextGr.setValue('matched_topic', intentAndTopicDetails.matchedTopic);
		this.contextGr.update();
	},

	/**
	 * Determines whether the current stage is supported
	 * @return {boolean} Whether to continue to execute the Intent processing stage
	 */
	_shouldStageContinue: function() {
		var predictionId = AutoResolutionPredictionHelper.getPredictionId(this.contextGr.getUniqueValue());
		if (AutoResolutionPredictionOutput.doesAgentZeroServiceOutputExist(predictionId))
			return true;

		this.setContextValue('intent_topic_state', AutoResolutionConstants.INTENT_TOPIC_STATE['NO_INTENT']);
		this.setContextReason(AutoResolutionConstants.NO_INTENT_REASON['INTENT_PREDICTION_NOT_ENABLED']);
		return false;
	},

    type: 'AutoResolutionIntentProcessingStage'
});
