var VAAISearchResultEventMetricCollector = Class.create();
VAAISearchResultEventMetricCollector.EVENT_TYPE = global.AISearchConstants.RESULT_EVENT_TYPE_SEARCH ;
	
VAAISearchResultEventMetricCollector.prototype = Object.extendsObject(global.VAAISearchMetricCollector, {
	
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
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_RESULT_TYPE, global.VAClickMetricsConstants.VALUE_AI_SEARCH_RESULT);
	},
	
	collect: function(data, itemIndex) {
		
		if (!this.isOperationAllowed() || gs.nil(data) || gs.nil(data.propValues))
			return;
		
		if (gs.nil(this.glideSignalsEvent)) {
			this.glideSignalsEvent 
				= new AISearchGlideSignalsSearchResultEvent(
					this.getSearchResultMetadata(), this.getParamBagForGlideSignalsEvent());
		}
		
		var model = data.propValues.model;
		
		if (gs.nil(model))
			return;
		
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_TITLE, global.AISearchHelper.getDocumentTitleFromModel(model));
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_DESCRIPTION, global.AISearchHelper.getDescriptionFromModel(model));
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_ORDER, itemIndex);
		
		var resultSysId = global.AISearchHelper.getResourceIdFromModel(model);
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_DOCUMENT_ID, resultSysId);
		
		var tableName = global.AISearchHelper.getResourceTableFromModel(model);
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_DOCUMENT_TABLE, tableName);
		
		var srcTable = global.AISearchHelper.getResourceTableFromModel(model);
		var dataSourceTitle = global.AISearchHelper.getDataSourceTitle(srcTable);
		
		this.setClickMetricsValue(VAClickMetricsConstants.KEY_DATA_SOURCE_TITLE, dataSourceTitle);
		this.glideSignalsEvent.buildPayload(data, global.AISearchConstants.CLICK_ACTION_SIGNAL_TYPE, itemIndex + 1);
	},
	
	getGlideSignalsPayload: function() {
		if (gs.nil(this.glideSignalsEvent))
			return {};
		
		return this.glideSignalsEvent.getPayload();
	},
	
	getGlideSignalsEventType : function() {
		return global.VAAISearchResultEventMetricCollector.EVENT_TYPE;
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
	},
	
	type: 'VAAISearchResultEventMetricCollector'
});														   
