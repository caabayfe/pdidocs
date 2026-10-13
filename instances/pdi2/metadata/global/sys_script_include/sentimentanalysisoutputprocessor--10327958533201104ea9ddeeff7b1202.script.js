// Template script to process response from ONE API call. 
// For every service plan in one_api_service_plan table, there should be a output processor script.

var SentimentAnalysisOutputProcessor = Class.create();
SentimentAnalysisOutputProcessor.prototype = {
    initialize: function() {
        this.LOGGER = new SentimentAnalysisLogger("SentimentAnalysis");
    },

    // Mandatory function in every processor. This method is called after a completed response is received from One API invocation.
    processCompleted: function(oneApiResponse) {
        this.LOGGER.info('SentimentAnalysisOutputProcessor input oneApiResponse - {0}', JSON.stringify(oneApiResponse));
        var SentimentAnalysisfeature = 'Sentiment Analysis';
        var feature = oneApiResponse.features[SentimentAnalysisfeature];

        if (feature && feature.status == "success") {
            this.LOGGER.info('SentimentAnalysisOutputProcessor input feature - {0}', JSON.stringify(feature));
            var result = feature.result;
            var conversationId = result.conversationId;
            var factor = result.factor;
            var conversationScore = 0;
            var sentimentScore = result.sentimentScore;
            var documentSentimentScore = result.documentSentimentScore;
            var endConversation = feature.requestPayload.isConversationEnded;
            if (sentimentScore) {

                var messageIds = Object.keys(sentimentScore);
                var n = messageIds.length;

                for (var i = 0; i < n; i++) {
                    var key = messageIds[i];
                    var normalisedSentiment = sn_cs.VASystemObject.getSentimentNormalisedScore(factor, sentimentScore[key]);
                    if (normalisedSentiment) {
                        normalisedSentiment = JSON.parse(normalisedSentiment);
                        conversationScore += normalisedSentiment.score;
                        if (endConversation) {
                            continue;
                        }
                        new global.SentimentUtil().updateMessageSentiment(key, normalisedSentiment.score, normalisedSentiment.sentiment);
                    }

                }
                if (conversationId) {
                    var conversationSentiment;
                    if (documentSentimentScore || documentSentimentScore == 0) {
                        conversationSentiment = sn_cs.VASystemObject.getSentimentNormalisedScore(factor, documentSentimentScore);
                    } else {
                        conversationSentiment = sn_cs.VASystemObject.getSentimentNormalisedScore(n, conversationScore);
                    }
                    if (conversationSentiment) {
                        conversationSentiment = JSON.parse(conversationSentiment);
                        new global.SentimentUtil().updateConversationSentiment(conversationId, conversationSentiment.score, conversationSentiment.sentiment);
                    }
                }

                this.LOGGER.info('SentimentAnalysisOutputProcessor updated sentiment successfully');
            }
        }

    },

    // Mandatory function in every processor. This method is called after an error response is received from One API invocation.
    processErrored: function(contextId, documentId, error) {
        this.LOGGER.error('Error occured while runnig one api runner - {0}', error);
    },

    // Mandatory function in every processor. This method is called if the one api call is cancelled.
    processCancelled: function(contextId, documentId) {
        this.LOGGER.info('Process cancelled');
    },

    type: 'SentimentAnalysisOutputProcessor'
};
