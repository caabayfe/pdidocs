var VAAISearchEventMetricCollector = Class.create();

VAAISearchEventMetricCollector.GENIUS_RESULT_TYPE = global.AISearchConstants.RESULT_TYPE_GENIUS;
VAAISearchEventMetricCollector.REGULAR_RESULT_TYPE = global.AISearchConstants.RESULT_TYPE_SEARCH;

VAAISearchEventMetricCollector.prototype = Object.extendsObject(global.VAAISearchMetricCollector, {
	
	vaVars: null,
	glideSignalsEvent: null,
	
	initialize: function(searchMetadata, vaSystem, vaInputs, vaVars) {
		this.vaVars = vaVars;
		vaVars.time = global.VAClickMetrics.getCurrentTime();
		VAAISearchMetricCollector.prototype.initialize.call(this, searchMetadata, vaSystem, vaInputs, vaVars);
		
		// if the click-metrics feature is disabled, don't proceed
		if (!this.isOperationAllowed())
			return;

		// For Click Metrics 
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_NAME, VAClickMetricsConstants.VALUE_SEARCH_TRIGGERED);
		
		// response time including overheads. 
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_RESPONSE_TIME, searchMetadata.execution_time+''); 
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_SEARCH_TERM, this.getQueryTerm(vaInputs));
	},
	
	/**
	* This method will be called after the searchResultMetadata is set.
	*/
	postSearchResultMetadata: function(searchResultMetadata) {
		
		var language = this._getLanguage(this.vaVars, searchResultMetadata);
		
		// language
		this.setParamBagForGlideSignalsEvent(global.AISearchConstants.QUERY_LANGUAGE, language);

		// analytics payload
		this.setParamBagForGlideSignalsEvent(
			global.AISearchConstants.SEARCH_ANALYTICS_PAYLOAD, this._getSearchAnalyticsPayload(searchResultMetadata));

		// intents for click metrics
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_LANGUAGE, language);
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_INTENT, this._getIntentForClickMetrics(searchResultMetadata));

		this.glideSignalsEvent 
			= new AISearchGlideSignalsSearchEvent(
				this.getSearchResultMetadata(), this.getParamBagForGlideSignalsEvent());

	},
	
	// Returns the search analytics payload from the search metadata 
	_getSearchAnalyticsPayload: function(searchResultMetadata) {
		return gs.nil(searchResultMetadata.searchAnalyticsPayload) ? {} : searchResultMetadata.searchAnalyticsPayload;
	},

	_getLanguage: function(vaVars, searchResultMetadata) {
		
		if(gs.nil(searchResultMetadata)) 
			return vaVars.language;
		
		var lang = searchResultMetadata[global.AISearchConstants.QUERY_LANGUAGE];
		return gs.nil(lang) ? vaVars.language : lang;
	},
	
	/**
	*  Returns the intents from the payload. Intents can be a comma-separated string.
	*/
	_getIntentForClickMetrics: function(searchResultMetadata) {
		
		var arr = [];
		
		// matched query intents for regular search
		var intents = searchResultMetadata[global.AISearchConstants.MATCHED_QEURY_INTENTS];
		
		if(!gs.nil(intents))
			arr.push(intents);
		
		// matched query intents for genius search.
		intents = searchResultMetadata[global.AISearchConstants.MATCHED_GENIUS_RESULT_INTENTS];
		if(!gs.nil(intents))
			arr.push(intents);
		
		return arr.join(',');
	},
	
	/**
	* Collect required search result metrics
	*/
	collect: function(resultType, searchResults) {
		
		if (!this.isOperationAllowed())
			return;

		if (gs.nil(this.glideSignalsEvent)) {
			this.glideSignalsEvent 
				= new AISearchGlideSignalsSearchEvent(
					this.getSearchResultMetadata(), this.getParamBagForGlideSignalsEvent());
		}

		this.glideSignalsEvent.buildPayload(resultType, searchResults);
	},
	
	getGlideSignalsPayload: function() {
		
		if (gs.nil(this.glideSignalsEvent))
			return {};
		return this.glideSignalsEvent.getPayload();
	},
	
	getGlideSignalsEventType : function() {
		return global.AISearchConstants.EVENT_TYPE_SEARCH_EVENT;
	},
	
	type: 'VAAISearchEventMetricCollector'
});
