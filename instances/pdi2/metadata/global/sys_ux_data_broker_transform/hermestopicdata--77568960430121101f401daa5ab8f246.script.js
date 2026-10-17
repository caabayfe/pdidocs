function transform(input) {
	var output = {
		"topic": topicName,
		"internal": isInternal,
		"timestamp": ""
    };
	try {
		var inspector = new sn_hermes.HermesTopicInspector();
		var topicName = input.topicName;
		var isInternal = input.isInternal != null ? input.isInternal : false;
		var service = input.service;
		gs.info("blabla "+service);
		if (topicName) {
			var message = inspector.getLastMessageFromTopicForService(topicName, isInternal, service);
			if (message == null) {
				return output;
			}
			var msgTime = message.getTimestamp();
			if (msgTime)
				output.timestamp = msgTime.toString();
		}
		return output;
	} catch (e) {
		return output;
	}
}
