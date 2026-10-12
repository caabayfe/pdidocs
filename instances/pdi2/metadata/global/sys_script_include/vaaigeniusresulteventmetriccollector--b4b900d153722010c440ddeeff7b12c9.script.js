var VAAIGeniusResultEventMetricCollector = Class.create();

VAAIGeniusResultEventMetricCollector.prototype = Object.extendsObject(global.VAAISearchMetricCollector, {
	
	glideSignalsEvent: null,
	
	initialize: function(searchMetadata, vaSystem, vaInputs, vaVars) {
		// update the object for the timestamp of the execution.
		vaVars.time = global.VAClickMetrics.getCurrentTime();
		global.VAAISearchMetricCollector.prototype.initialize.call(this, searchMetadata, vaSystem, vaInputs, vaVars);
	},
	
	/**
	* This method will be called after the searchResultMetadata is set.
	*/
	postSearchResultMetadata: function(searchResultMetadata) {
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_NAME, global.VAClickMetricsConstants.VALUE_SEARCH_RESULT_DISPLAYED);
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_RESULT_TYPE, global.VAClickMetricsConstants.VALUE_GENIUS_CARD);
	},
	
	collect: function(data, itemIndex) {
		
		if (!this.isOperationAllowed() || gs.nil(data))
			return;
		
		var propValues = data.propValues;
		var model = data.propValues.model;
		var action = data.propValues.actions[0];
		
		if (gs.nil(model) || gs.nil(action))
			return;
		
		// GlideSignals
		if (gs.nil(this.glideSignalsEvent)) 
			this.glideSignalsEvent 
				= new global.AISearchGlideSignalsGeniusResultEvent(
					this.getSearchResultMetadata(), this.getParamBagForGlideSignalsEvent());
		
		this.glideSignalsEvent.buildPayload(data);
		
		// click metrics
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_RESULT_TYPE, global.VAClickMetricsConstants.VALUE_GENIUS_CARD);
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_ORDER, itemIndex);
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_TITLE, global.AISearchHelper.getDocumentTitleFromModel(model));
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_DESCRIPTION, global.AISearchHelper.getDescriptionFromModel(model));
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_DOCUMENT_ID, global.AISearchHelper.getResourceIdFromModel(model));
		
		var tableName = global.AISearchHelper.getResourceTableFromModel(model);
		
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_DOCUMENT_TABLE, tableName);
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_DATA_SOURCE_TITLE, global.AISearchHelper.getDataSourceTitle(tableName));
	},
	
	getGlideSignalsPayload: function() {
		if (gs.nil(this.glideSignalsEvent))
			return {};
		
		return this.glideSignalsEvent.getPayload();
	},
	
	getGlideSignalsEventType: function() {
		return global.AISearchConstants.RESULT_EVENT_TYPE_GENIUS;
	},
	
	sendOutMetrics: function() {
		
		// Note that this payload does not include GlideSignal's payload.
		// This payload only contains click_metrics playload. GlideSignals' payload will be sent to GlideSignals API via click_metrics' URL
		// we're sending this payload for DISPLAY event purpose.
		if (!this.isOperationAllowed() || gs.nil(this.getPayload()))
			return; 
		
		var payload = this.getPayload();
		payload.glide_signals = {};
		
		var payloadStr = JSON.stringify(payload);
		global.VAClickMetrics.queueAISearchEvent(this.getConversationId(), this.getConversationTaskId(), payloadStr);
		return payload;
	},
	
	type: 'VAAIGeniusResultEventMetricCollector'
});														   
