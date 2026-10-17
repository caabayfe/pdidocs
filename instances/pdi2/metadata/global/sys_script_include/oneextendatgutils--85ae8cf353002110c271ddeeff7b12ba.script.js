var OneExtendATGUtils = Class.create();
OneExtendATGUtils.prototype = {
    initialize: function() {},

    parserNLQ: function(table_name, utterance) {
        var output = {};
        try {
            // Call parser api
            var parser_output = SNC.NLQJavascriptProcessor.apply(table_name, utterance, "CB");
            var error_message = parser_output.get("errorMessage");

            if (error_message !== null && error_message !== '' && error_message !== 'null') {
                output['message'] = error_message;
                output['status'] = 'error';
                output['encoded_query'] = '';
            } else {
                var filter = JSON.parse(parser_output.get('parserOutput'))['filter'];
                output['encoded_query'] = filter;
                output['status'] = 'success';
            }
        } catch (e) {
            output['encoded_query'] = '';
            output['status'] = 'error';
            output['message'] = 'Unexpected error: ' + e;
        }

        return output;
    },

    detectIntents: function(utterance, model_name) {
        var output = {};

        try {
            var inputJson = {
                "utterance": utterance
            };
            // Call NLU api
            var solutionVersion = global.NLUStudioService.getPublishedVersion(model_name);
            var predictionResults = solutionVersion.predict(inputJson, {});

            predictionResults = JSON.parse(predictionResults);

            if (predictionResults['status'] === 'success') {
                output['status'] = 'success';

                var intents = predictionResults['response']['intents'];
                var intentNames = [];
                for (var idx in intents) {
                    intentNames.push(intents[idx]['intentName']);
                }

                output['intents'] = intentNames;

            } else {
                output['status'] = 'error';
                output['intents'] = [];
                output['message'] = 'Prediction error';
            }
        } catch (e) {
            output['status'] = 'error';
            output['intents'] = [];
            output['message'] = 'Unexpected error : ' + e;
        }

        return output;
    },

    type: 'OneExtendATGUtils'
};
