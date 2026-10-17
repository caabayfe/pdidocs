var VAAIGeniusResultFeedbackMetricCollector = Class.create();

VAAIGeniusResultFeedbackMetricCollector.prototype = Object.extendsObject(global.VAAIGeniusResultEventMetricCollector, {
	
	glideSignalsEvent: null,
	feedbackValue:null,

	initialize: function(searchMetadata, vaSystem, vaInputs, vaVars, feedbackValue) {

		this.feedbackValue = feedbackValue; // User feedback value.
		global.VAAIGeniusResultEventMetricCollector.prototype.initialize.call(this, searchMetadata, vaSystem, vaInputs, vaVars);
	},
	
	collect: function(data, itemIndex) {
		
		if (!this.isOperationAllowed()) // removing check for null data as it is taken care by the buildPayload method
			return;
	
		// create a payload for glide signals.
		if (gs.nil(this.glideSignalsEvent)) {

			this.glideSignalsEvent 
				= new global.AISearchGlideSignalsGeniusResultEvent(this.getSearchResultMetadata(), this.getParamBagForGlideSignalsEvent());
		}

		// build the glide signals payload. Note that this payload is for genius result click event.
		this.glideSignalsEvent.buildPayload(data);
		
		//Since the payload is for genius card result click, actionType and actionValue need to be overwritten here.
		this.glideSignalsEvent.setValue(global.AISearchConstants.ACTION_TYPE, global.AISearchConstants.ACTION_TYPE_FEED_BACK);
		this.glideSignalsEvent.setValue(global.AISearchConstants.ACTION_VALUE, this.feedbackValue);
	},
	
	sendOutMetrics: function() {
		// do nothing. The payload for feedback is not getting sent out from this method.
	},

	type: 'VAAIGeniusResultFeedbackMetricCollector'
});														   
