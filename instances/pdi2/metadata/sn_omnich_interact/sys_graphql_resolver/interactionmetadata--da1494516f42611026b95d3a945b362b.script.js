(function process( /*ResolverEnvironment*/ env) {

    var interactionSysId = env.getArguments().interactionSysId;
    var conversationSysId = env.getSource().conversationSysId;
    var conversationUtil = new sn_omnich_interact.ConversationGraphQLUtil();
    var conversationSentiment = conversationUtil.getConversationSentiment(conversationSysId);
    var audioTranscriptAttachmentId = conversationUtil.getAudioTranscriptAttachmentId(interactionSysId);
    return {
        audioTranscriptAttachmentId: audioTranscriptAttachmentId,
        conversationSentiment: conversationSentiment
    };

})(env);
