var ConversationExporter = Class.create();
ConversationExporter.prototype = {
    initialize: function() {},

	getDownloadID: function(conversationID) {
        var transcriptBuilder = new VAChatTranscriptBuilder(conversationID);
        var response = transcriptBuilder.getTranscript();
        var gr = transcriptBuilder.getConversationGr();

        var gsa = new GlideSysAttachment();
        var attachmentId = "";
        try {
            attachmentId = gsa.write(gr, gs.generateGUID() + ".txt", 'text/csv', response);
        } catch (err) {
            var message = "Chat Transcript creation failed: " + err.message;
            CIAnalyticsLogger.getLogger('ConversationExporter').error(message);
        }

        return attachmentId;
    },

    type: 'ConversationExporter'
};
