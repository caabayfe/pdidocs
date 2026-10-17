var VAPreTopicDiscoveryInputProcessor = Class.create();
VAPreTopicDiscoveryInputProcessor.prototype = {
    initialize: function() {
    },
	
	process: function(input) {
		var featurePayload = {};
		
		// Prepare payload for Virtual Agent Language Detection
		var langDetect = {"utterance" : input["utterance"]};
		
		featurePayload["Virtual Agent Language Detection"] = langDetect;
		return featurePayload;
	},
	
	shouldPause: function(input) {
		return false;
	},

    type: 'VAPreTopicDiscoveryInputProcessor'
};
