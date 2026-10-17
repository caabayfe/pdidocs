var AutoResolutionMLAjax = Class.create();
AutoResolutionMLAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {	
	
	/*
	perform all the required server-side checks
	*/
	doMLandNLUChecks: function() {		

		var autoResConfigSysId = this.getParameter('sysparm_sysId');
		var intentsPresent = new AutoResolutionIntentChoiceListBuilder().checkIfOOBIntentListIsValid();
		var languageConfigPresent = AutoResolutionLanguageHelper.isLanguageConfigRecordPresent(autoResConfigSysId);
		
		var trainingCompleted = this._isTrainingCompleted(autoResConfigSysId);
		
		var result = {
			intentsPresent: intentsPresent,
			languageConfigPresent: languageConfigPresent,
			trainingCompleted: trainingCompleted
		};

		return JSON.stringify(result);		
	},
	
	areTrainingsCompleted: function() {
		var autoResConfigSysId = this.getParameter('sysparm_sysId');
		return this._isTrainingCompleted(autoResConfigSysId);
	},
	
	_isTrainingCompleted: function(autoResConfigSysId) {
		var trainingCompleted = true;
		var mlHelper = AutoResolutionMLFactory.createMLHelper(autoResConfigSysId);
		var capability = mlHelper.getCapability();
		if (capability !== AutoResolutionConstants.ML_CAPBILITIES.LANGUAGEX
			|| capability !== AutoResolutionConstants.ML_CAPBILITIES.COMPOSITE)
			trainingCompleted = mlHelper.checkAllLanguageModelsTrainingCompleted();	
		return trainingCompleted;
	},
	
    type: 'AutoResolutionMLAjax'
});
