var VAAISearchResultFeedbackEventMetricCollector = Class.create();
VAAISearchResultFeedbackEventMetricCollector.EVENT_TYPE = global.AISearchConstants.RESULT_EVENT_TYPE_SEARCH ;
	
VAAISearchResultFeedbackEventMetricCollector.prototype = Object.extendsObject(global.VAAISearchResultEventMetricCollector, {
	
	glideSignalsEvent: null,
	feedbackValue:null,
	
	initialize: function(searchMetadata, vaSystem, vaInputs, vaVars, feedbackValue) {

		this.feedbackValue = feedbackValue; // User feedback value.
		global.VAAISearchMetricCollector.prototype.initialize.call(this, searchMetadata, vaSystem, vaInputs, vaVars);
	},
	
	collect: function(data, itemIndex) {
		
		if (!this.isOperationAllowed() || gs.nil(data))
			return;
		
		var propValues = data.propValues;
		var model = propValues.model;
		
		if (gs.nil(model))
			return;
	
		// create a payload for glide signals.
		if (gs.nil(this.glideSignalsEvent)) {

			this.glideSignalsEvent 
				= new global.AISearchGlideSignalsSearchResultEvent(this.getSearchResultMetadata(), this.getParamBagForGlideSignalsEvent());
		}

		// build the glide signals payload. Note that this payload is for regular result click event.
		this.glideSignalsEvent.buildPayload(data);
		
		//adding feedback related data here.
		this.glideSignalsEvent.setValue(global.AISearchConstants.ACTION_TYPE, global.AISearchConstants.ACTION_TYPE_FEED_BACK);
		this.glideSignalsEvent.setValue(global.AISearchConstants.ACTION_VALUE, this.feedbackValue);
	},
	
	sendOutMetrics: function() {
		// do nothing. The payload for feedback is not getting sent out from this method.	
	},
	
	type: 'VAAISearchResultFeedbackEventMetricCollector'
});														   
