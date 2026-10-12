var AutoResolutionExitConditionStage = Class.create();
AutoResolutionExitConditionStage.prototype = Object.extendsObject(AutoResolutionTaskProcessingStage, {

	getStateValue: function() {
		return AutoResolutionConstants.TASK_PROCESSING_STATE.EXIT_CONDITION;
	},

	execute: function(contextFieldValueMap) {
		this.prepare(contextFieldValueMap, this.type);

		var exitCondition = this.configGr.getValue("exit_condition");
		if (gs.nil(exitCondition))
			return this.response;

		// Get the prediction result record, assuming there is only 1 prediction record per context record
		var predictionGr = new GlideRecord(AutoResolutionConstants.PREDICTION_TABLE_NAME);
		predictionGr.addQuery("ar_context", this.contextId);
		predictionGr.query();

		// No prediction record created for the context, LanguageX might not have been invoked
		if (!predictionGr.next())
			return this.response;

		// if no search terms are found (possibly due to threshold), we exit from the IAR flow
		if (!this._hasSearchTerms(predictionGr)) {
			this.setContextValue('reason', 'No search terms found');
			this.setError();
			return this.response;
		}
		
		// if the condition on predictionGr matches the criteria on exit condition, we exit from the IAR flow
		if (GlideFilter.checkRecord(predictionGr, exitCondition)) {
			this.setContextValue('reason', 'Exit condition evaluation is met for the task');
			this.setError();
			return this.response;
		}

		return this.response;
	},
	
	_hasSearchTerms:function(predictionGr) {
		var searchTerms = predictionGr.getValue('predicted_search_query');
		return !gs.nil(searchTerms) && searchTerms.trim().length > 0;
	},

	type: 'AutoResolutionExitConditionStage'
});
