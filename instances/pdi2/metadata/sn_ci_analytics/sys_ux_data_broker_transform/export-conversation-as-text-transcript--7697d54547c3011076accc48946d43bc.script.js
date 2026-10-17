function transform(input) {
    var response = {};
    if (input.conversationId) {
        var transcript = new sn_ci_analytics.ConversationExporter();
        var download_id = transcript.getDownloadID(input.conversationId);
        response = {
            download_id: download_id,
        };
    }
    return response;
}
