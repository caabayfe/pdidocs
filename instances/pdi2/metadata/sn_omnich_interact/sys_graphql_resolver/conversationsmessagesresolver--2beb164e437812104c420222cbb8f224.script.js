(function process(/*ResolverEnvironment*/ env) {

	var data = env.getArguments()["conversationsLatestSequence"];
	var results = [];
	for(var i=0; i<data.length; i++){
		const conversationSysId = data[i].conversationSysId;
		const latestSequence = data[i].sequence;
		var agentChatMessageDtos = (sn_cs.AgentChatScriptObject.fetchMessages(conversationSysId, latestSequence, false));
		var messageList = [];
		for (var j = 0; j < agentChatMessageDtos.length; j++) {
			var m = {};
			var message = agentChatMessageDtos[j];
			// Filter out action messages which are not used.
			if (message.messageType === "action" && (
				!message.payload.contains("\"type\":\"System\""))) {
					continue;

			}
			m.conversationSysId = message.conversationSysId;
			m.system = message.system;
			m.messageType = message.messageType;
			m.createdBy = message.createdBy;
			m.createdAt = message.createdAt;
			m.sequence = message.sequence;
			m.senderName = message.senderName;
			m.payload = message.payload;
			messageList.push(m);
		}
		// decending order and get upto only the latest 3 messages
		messageList.sort((a, b) => {
			return b.createdAt - a.createdAt;
		});
		const result = {
			conversationSysId,
			messages: messageList.slice(0, 3)
		};
		results.push(result);
	}
	return results;

})(env);
