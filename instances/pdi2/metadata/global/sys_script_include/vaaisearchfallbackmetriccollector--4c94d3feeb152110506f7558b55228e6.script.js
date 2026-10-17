var VAAISearchFallbackMetricCollector = Class.create();
VAAISearchFallbackMetricCollector.EVENT_TYPE = global.AISearchConstants.EVENT_TYPE_SEARCH_EVENT;

VAAISearchFallbackMetricCollector.prototype = Object.extendsObject(global.VAAISearchMetricCollector, {

	glideSignalsEvent: null,

	initialize: function(searchMetadata, vaSystem, vaInputs, vaVars) {
		vaVars.time = global.VAClickMetrics.getCurrentTime();
		global.VAAISearchMetricCollector.prototype.initialize.call(this, searchMetadata, vaSystem, vaInputs, vaVars);
	},

	postSearchResultMetadata: function(searchResultMetadata) {
		this.setClickMetricsValue(global.VAClickMetricsConstants.KEY_NAME, global.VAClickMetricsConstants.VALUE_SEARCH_FALLBACK_EVENT);
	},

	collect: function() {
		if (!this.isOperationAllowed())
			return;

		if (gs.nil(this.glideSignalsEvent))
			this.glideSignalsEvent = new AISearchGlideSignalsSearchEvent(this.getSearchResultMetadata(), this.getParamBagForGlideSignalsEvent());

		this.glideSignalsEvent.buildPayload(null, null);
	},

	getGlideSignalsPayload: function() {
		if (gs.nil(this.glideSignalsEvent))
			return {};

		return this.glideSignalsEvent.getPayload();
	},

	getGlideSignalsEventType : function() {
		return global.VAAISearchFallbackMetricCollector.EVENT_TYPE;
	},

	sendOutMetrics: function() {
		// Note: This payload only contains the click_metrics payload.

		if (!this.isOperationAllowed() || gs.nil(this.getPayload()))
			return; 

		var payload = this.getPayload();
		payload.glide_signals = {};

		var payloadStr = JSON.stringify(payload);
		global.VAClickMetrics.queueAISearchEvent(this.getConversationId(), this.getConversationTaskId(), payloadStr);
	},

	type: 'VAAISearchFallbackMetricCollector'
});
