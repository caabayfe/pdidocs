var PreTopicDiscoveryInputProcessor = Class.create();
PreTopicDiscoveryInputProcessor.prototype = {
    initialize: function() {
    },
	
	process: function(input) {
		var featurePayload = {};
		
		// Build payload for language detection feature
		var langDetect = {"utterance" : input["utterance"]};
		featurePayload["Virtual Agent Language Detection"] = langDetect;
		
		return featurePayload;
	},
	
	shouldPause: function(input) {
		return false;
	},

    type: 'PreTopicDiscoveryInputProcessor'
};
