(function process( /*ResolverEnvironment*/ env) {

    var interactionSysId = env.getArguments().interactionSysId;
    var conversationSysId = env.getSource().conversationSysId;
    var audioTranscriptAttachmentId = getAudioTranscriptAttachmentId(interactionSysId);
    var conversationSentiment = getConversationSentiment(conversationSysId);
    return {
        audioTranscriptAttachmentId: audioTranscriptAttachmentId,
        conversationSentiment: conversationSentiment
    };

    function getAudioTranscriptAttachmentId(interactionSysId) {
        var attachmentGr = new GlideRecord('sys_attachment');
        attachmentGr.addQuery("table_sys_id", interactionSysId);
        attachmentGr.addEncodedQuery("file_nameLIKE" + interactionSysId + "_recording^content_typeSTARTSWITHaudio");
        attachmentGr.query();

        if (attachmentGr.next()) {
            return attachmentGr.getValue("sys_id");
        }

        return "";
    }

    function getConversationSentiment(conversationSysId) {
        var convGr = new GlideRecord('sys_cs_conversation');
        if (convGr.get(conversationSysId)) {
            return convGr.getValue('sentiment');
        }
        return '';
    }

})(env);
