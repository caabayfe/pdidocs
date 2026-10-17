(function process( /*ResolverEnvironment*/ env) {
    var conversationId = env.getArguments()["conversationId"];
    var message = env.getArguments()["chatMessage"];
	if (message === "") {
		return null;
	}
	var attachments = env.getArguments()["attachments"];
	var internal = env.getArguments()["internal"];
	var agentChatMessageDtos = sn_cs.AgentChatScriptObject.send(conversationId, message, attachments, internal);
	var result = [];
    for (var i = 0; i < agentChatMessageDtos.length; ++i) {
        var m = {};
        var msg = agentChatMessageDtos[i];
        m.conversationSysId = msg.conversationSysId;
        m.initials = msg.initials;
        m.senderLiveProfileSysId = msg.senderLiveProfileSysId;
        m.avatar = msg.avatar;
        m.createdAt = msg.createdAt;
        m.system = msg.system;
        m.messageType = msg.messageType;
        m.payload = msg.payload;
        m.createdBy = msg.createdBy;
        m.agentTranslatedMessage = msg.agentTranslatedMessage;
        m.status = msg.status;
        m.sequence = msg.sequence;
        m.internal = msg.internal;
        m.transitory = msg.transitory;
        m.senderName = msg.senderName;
        m.externalChatStatus = msg.externalChatStatus;
        result.push(m);
    }
    return result;
})(env);
