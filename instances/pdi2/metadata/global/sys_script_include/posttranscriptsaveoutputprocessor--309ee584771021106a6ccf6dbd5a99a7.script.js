var PostTranscriptSaveOutputProcessor = Class.create();
PostTranscriptSaveOutputProcessor.prototype = {
    initialize: function() {},
    // This method is called for every VA One Api Call complete response.
    // It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
    processCompleted: function(oneApiResponse) {
        new global.SentimentAnalysisOutputProcessor().processCompleted(oneApiResponse);
        var sentimentUtil = new global.SentimentUtil();
        var conversationId = oneApiResponse["documentId"];
        var interactionDetails = sentimentUtil.getInteractionAssignedToAndId(conversationId);
        sentimentUtil.createInteractionInsight(conversationId, interactionDetails.interactionId, interactionDetails.agent);
    },

    // This method is called for every VA One Api Call error response.
    // It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
    processErrored: function(contextId, documentId, error) {
        new global.SentimentAnalysisOutputProcessor().processErrored(contextId, documentId, error);
    },

    // This method is called for every VA One Api Call cancel response.
    // It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
    processCancelled: function(contextId, documentId) {
        new global.SentimentAnalysisOutputProcessor().processCancelled(contextId, documentId);
    },

    type: 'PostTranscriptSaveOutputProcessor'
};
