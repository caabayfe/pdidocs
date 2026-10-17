var SensitiveDataHandling = Class.create();
SensitiveDataHandling.prototype = {
    initialize: function() {
		this.logger = new GlideChatbotLoggerSetupUtil("com.glide.sensitive_data_handling").setup();
    },
	execute: function(inputs) {
        var sensitiveDataAnalyzer = new sn_sensitive.SensitiveDataAnalyzer();
        var outputs = {};
        try {
			var inputText = inputs.text;
            var isSensitive = sensitiveDataAnalyzer.isTextSensitive(inputText);
            if (isSensitive)
                var anonymizedText = sensitiveDataAnalyzer.analyzeText(inputText);

            outputs['isSensitive'] = isSensitive;
            outputs['anonymizedText'] = anonymizedText;
            outputs['status'] = 'success';

        } catch (e) {
			var errorMessage = "Error while detecting sensitive data in message. error: " + e.message;
            this.logger.error(errorMessage);
            outputs['isSensitive'] = false;
            outputs['anonymizedText'] = "";
            outputs['status'] = 'error';
            outputs['message'] = errorMessage;
        }

        var outputJson = {'output' : outputs};
        return outputJson;
    },
	
    type: 'SensitiveDataHandling'
};
