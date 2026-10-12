(function process( /*ResolverEnvironment*/ env) {

    var conversationSysId = env.getSource().conversationSysId;
    var type = env.getSource().type;
    var previousInteractions = (sn_cs.AgentChatScriptObject.fetchPreviousInteractions(conversationSysId, type));
    var result = [];
    for (var i = 0; i < previousInteractions.length; ++i) {
        var it = {};
        var interaction = previousInteractions[i];
        it.conversationSysId = interaction.conversationSysId;
        it.number = interaction.number;
        it.sysId = interaction.sysId;
        it.audioTranscriptAttachmentId = interaction.audioTranscriptAttachmentId;
        it.duration = interaction.duration;
        it.sentiment = interaction.sentiment;
        it.type = interaction.type;
        result.push(it);
    }

    return result;


})(env);
