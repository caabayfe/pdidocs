var LastErrorUtils = Class.create();
LastErrorUtils.prototype = {
    	
	initialize: function() {
    },
	
	updateErrorMsg: function(gr, errorKey, errorMsg) {

		lastErrorJson = gr.getValue("last_error_json");

		if (GlideStringUtil.nil(lastErrorJson)) {
			lastErrorJson = "{}";
		}
		var errorMsgObj = {};
		
		try {
			errorMsgObj = JSON.parse(lastErrorJson);
		}
		catch (ex) {
			gs.error("Error on parsing json " + JSON.stringify(lastErrorJson) + ", on LastErrorUtils Script include.");
		}
		
		errorMsgObj[errorKey] = errorMsg;
		
		var finalMessage = "";
		for (var currentKey in errorMsgObj) {
			var currentMsg = errorMsgObj[currentKey];
			if (GlideStringUtil.notNil(currentMsg)) {
				finalMessage += currentMsg + "\n\n";
			}
		}
		
		var jsonRes = JSON.stringify(errorMsgObj);
		gr.setValue('last_error_message', finalMessage);
		gr.setValue('last_error_json', jsonRes);

	},

    type: 'LastErrorUtils'
};
