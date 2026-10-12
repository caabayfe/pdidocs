/*
Template script for input processor to create one api feature requests.
'input' for the process method is a JSON which could contain data required to create feature request payload.

Expected return type is a JSON with featureId as key and the payload as value.
Sample output

{
	'DT' : {
		'utterance' : 'value1',
		'targetLanguage' : 'value2',
	},
	
	'SENT' : {
		'key3' : 'value3',
		'key4' : 'value4',
	}

}
*/

var OneAPiInputProcessorTemplate = Class.create();
OneAPiInputProcessorTemplate.prototype = {
    initialize: function() {
    },
	
	process: function(input) {
		return input;
	},
	
	shouldPause: function(input) {
		return false;
	},

    type: 'OneAPiInputProcessorTemplate'
};
