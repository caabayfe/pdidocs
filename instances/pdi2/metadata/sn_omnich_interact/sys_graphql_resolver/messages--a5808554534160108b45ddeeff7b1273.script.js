(function process( /*ResolverEnvironment*/ env) {
    var conversationSysId = env.getSource().sysId;
    var boundaryId = env.getArguments().boundaryId || "";
    var limit = env.getArguments().limit;
    var before = env.getArguments().before;
    var agentChatMessageDtos = (sn_cs.AgentChatScriptObject.fetchMessages(conversationSysId, boundaryId, before, limit));
    var result = [];
    for (var i = 0; i < agentChatMessageDtos.length; ++i) {
        var m = {};
        var message = agentChatMessageDtos[i];
		// Filter out action messages which are not used.
		if (message.messageType === "action" && (
			!message.payload.contains("\"type\":\"System\""))) {
				continue;

		}
        m.conversationSysId = message.conversationSysId;
        m.initials = message.initials;
        m.senderLiveProfileSysId = message.senderLiveProfileSysId;
        m.avatar = message.avatar;
        m.createdAt = message.createdAt;
        m.system = message.system;
        m.messageType = message.messageType;
        m.payload = message.payload;
        m.createdBy = message.createdBy;
        m.agentTranslatedMessage = message.agentTranslatedMessage;
        m.status = message.status;
        m.sequence = message.sequence;
        m.internal = message.internal;
        m.transitory = message.transitory;
        m.isProfane = message.profane;
        m.senderName = message.senderName;
        m.sentiment = message.sentiment;
        m.feedback = message.feedback;
        m.messageId = message.messageId;
        m.messageUpdated = message.messageUpdated;
	      m.isBotMessage = message.botMessage;
        m.externalChatStatus = message.externalChatStatus; 
        result.push(m);
    }

    return result;

})(env);
