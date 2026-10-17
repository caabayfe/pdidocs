var VAAISearchMetricCollector = Class.create();

VAAISearchMetricCollector.prototype = {
	
	payload: null,
	isAllowed:false,
	searchResultMetadata:null,
	
	conversationId:null,
	conversationTaskId:null,
	
	paramBag: {}, // parameter bags for GideSignals' tracking event
	
	initialize: function(searchMetadata, vaSystem, vaInputs, vaVars) {
		
		this.payload = {};
		this.payload.metadata = {};
		
		this.payload.metadata.glide_signals_event_type = this.getGlideSignalsEventType();
		this.payload.metadata.is_logged_in = vaVars.is_logged_in;
		
		this.payload.metadata.search_id = searchMetadata.search_id;
		this.payload.metadata.search_result_count = searchMetadata.search_result_count+'';
		
		
		this.payload.glide_signals = {};
		this.payload.click_metrics = {};
		
		this.isAllowed = global.VAClickMetrics.isAISearchClickMetricsAllowed();
		
		//if signal collection is not allowed, just return.
		if (!this.isAllowed)
			return;
		
		//VA click metrics attributes
		var ts = vaVars.time;
		
		if(gs.nil(ts)) // if the start timestamp is not found, create one now.
			ts = global.VAClickMetrics.getCurrentTime();
		
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_TIME, ts);
		
		this.conversationId = vaSystem.getConversationId();
		this.setClickMetricsValue(global.VAClickMetricsConstants.CONVERSATION_ID, this.conversationId);
		
		this.conversationTaskId = vaSystem.getConversationTaskId();
		this.setClickMetricsValue(global.VAClickMetricsConstants.CONVERSATION_TASK_ID, this.conversationTaskId);
		
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_SEARCH_TYPE, global.VAClickMetricsConstants.VALUE_AI_SEARCH);
		
		this.setParamBagForGlideSignalsEvent(global.AISearchConstants.USER_ID, this._getUserId(searchMetadata));
		this.setParamBagForGlideSignalsEvent(global.AISearchConstants.SESSION_ID, searchMetadata.session_id);
		
		// sets the search profile Id.
		var searchProfileId = vaSystem.getContextProfileId();
		this.setParamBagForGlideSignalsEvent(global.AISearchConstants.SEARCH_PROFILE, searchProfileId);

		// if searchContextId is not provided by the caller, 
		// need to look up the right one with the provided search profile Id.
		var searchContextId =  vaInputs.search_application_configuration.toString();

		if (gs.nil(searchContextId))
			searchContextId 
				= global.VAAISearchHelper.getSearchApplicationConfigurationIdBySearchProfileId(searchProfileId);

		this.setParamBagForGlideSignalsEvent(global.AISearchConstants.SEARCH_CONTEXT_CONFIG_ID, searchContextId);
		this._setSearchResultMetadata(searchMetadata);
		
		// Query term.
		var queryTerm = this.getQueryTerm(vaInputs);
		this.setParamBagForGlideSignalsEvent(global.AISearchConstants.QUERY_TERM, queryTerm);
	},
	
	isOperationAllowed:function() {
		return this.isAllowed;
	},
	
	getQueryTerm : function(vaInputs) {
		
		if (gs.nil(this.searchResultMetadata))
			return vaInputs.search_term.toString();
	
		return !gs.nil(this.searchResultMetadata.correctedSearchTerm)? 
					this.searchResultMetadata.correctedSearchTerm : 
						this.searchResultMetadata.searchTerm;
	},
	
	getGlideSignalsEventType: function() {
		throw 'Need to implement';
	},
	
	_setSearchResultMetadata: function(searchMetadata) {
		
		if (gs.nil(searchMetadata))
			return;
		
		var searchResultMetadata = searchMetadata.glide_signals.searchResultMetadata;
		
		if (gs.nil(searchResultMetadata))
			return;
		
		this.searchResultMetadata = searchResultMetadata;
		
		this.postSearchResultMetadata(searchResultMetadata);
	},
	
	postSearchResultMetadata:function(searchResultMetadata) {
		// do nothing. Need to be overridden by a subclass
	},
	
	getSearchResultMetadata: function() {
		return this.searchResultMetadata;
	},
	
	sendOutMetrics: function() {
		
		if (!this.isAllowed)
			return; 
		
		var payload = JSON.stringify(this.getPayload());
		return global.VAClickMetrics.queueAISearchEvent(this.conversationId, this.conversationTaskId, payload);
	},
    
	getConversationId: function() {
		return this.conversationId;
	},
	
	getConversationTaskId: function() {
		return this.conversationTaskId;
	},
	
	getParamBagForGlideSignalsEvent: function() {
		return this.paramBag;
	},
	
	getPayload: function() {
		var payload = this.payload;
		
		// merge the glide signals payload in to the main payload.
		payload.glide_signals = this.getGlideSignalsPayload();
		
		return payload;
	},
	
	getGlideSignalsPayload: function() {
		throw 'Need to be implemented';
	},
	setParamBagForGlideSignalsEvent: function(name, val) {
		this.setValue(this.paramBag, name, val);
	},
	setGlideSignalsValue: function(name, val) {
		this.setValue(this.payload.glide_signals, name, val);
	},
	
	setClickMetricsValue: function(name, val) {
		this.setValue(this.payload.click_metrics, name, val);
	},
	
	setValue: function(obj, name ,val) {
		obj[name] = gs.nil(val)? '': val+''; 
	},
	
	_getUserId:function(searchMetadata) {
		return searchMetadata.is_logged_in? searchMetadata.user_id: '';
	},
	
	type: 'VAAISearchMetricCollector'
};
