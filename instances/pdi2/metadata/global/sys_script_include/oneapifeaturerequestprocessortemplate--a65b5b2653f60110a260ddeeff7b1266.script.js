/**
This is a sample Feature Request Processor script.
The function 'process' takes a JSON input and returns a JSON output.
The JSON output is passed AS-IS to the feature provider script.
*/

var OneApiFeatureRequestProcessorTemplate = Class.create();
OneApiFeatureRequestProcessorTemplate.prototype = {
    initialize: function() {
    },
	
	process: function(input) {
		return input;
	},

    type: 'OneApiFeatureRequestProcessorTemplate'
};
