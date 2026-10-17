var AutoResolutionIntentChoiceListBuilder = Class.create();
AutoResolutionIntentChoiceListBuilder.prototype = {
	
	supportedIntentsList: [],
	
	initialize: function() {
	},
	
	getSupportedIntents: function(configSysId) {
		this.supportedIntentsList = this._getIntentsFromAPI(configSysId);
		var list = new GlideChoiceList();						
		for (i=0; i<this.supportedIntentsList.length; i++) 
			list.add(new GlideChoice(this.supportedIntentsList[i], this.supportedIntentsList[i]));	
		return list;				
	},
	
	/*
	API Syntax
	var options = {
	 'processingLanguage' : 'de' // optional, defaults to en
	};
	sn_ml.AgentZeroSolutionStore.getSupportedOOBIntents(options);
	*/
	_getIntentsFromAPI: function(configSysId) {
		try {
			var options = {};
			var gr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
			gr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, configSysId);
			gr.addEncodedQuery(AutoResolutionConstants.COMPOSITE_ENCODED_QUERY);
			gr.query();
			
			if (gr.next()){
				options = {
					"solutionName": gr.getValue('ml_solution_name'),
					"taskType": AutoResolutionUtil.getTaskType(gr.configuration.getRefRecord().getValue('target_table_name'))
				};
			}
		
			var results = sn_ml.AgentZeroSolutionStore.getSupportedOOBIntents(options);
			if (!gs.nil(results))
				return JSON.parse(results);
			return [];
		} catch (ex) {
			new AutoResolutionLoggingUtils().createLogger().error('Error getting supported intents: {0}', ex.getMessage());
			return [];
		}
	},
	
	checkIfOOBIntentListIsValid: function() {
		this.supportedIntentsList = this._getIntentsFromAPI();
		return this.supportedIntentsList.length > 0;	
	},

    type: 'AutoResolutionIntentChoiceListBuilder'
};
