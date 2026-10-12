(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	var messageId = current.message_id;
	var conversationId = current.message_id.conversation.sys_id;
	var mobileData = sn_cs.VASystemObject.getContextVariables(conversationId, ["global_mobile_channel_id", "global_mobile_channel_type"]);
	var mobileChannelId;
	var mobileChannelType;

	if (mobileData) {
		mobileChannelId = mobileData["global_mobile_channel_id"];
		mobileChannelType = mobileData["global_mobile_channel_type"];
	}

	var json = { 
		"aps": {
			"alert": {
				"title": current.push_title,
			"body": sn_cs.VASystemObject.getTextValueForMessage(messageId)
			},
			"sound": "default",
			"thread-id": "launch_virtual_agent"
		}, 
		"type": "launch_virtual_agent",
		"conversationId": conversationId,
		"messageId": messageId
	};

	if (mobileChannelId) {
		json["mobileChannelId"] = mobileChannelId;
	}

	if (mobileChannelType) {
		json["mobileChannelType"] = mobileChannelType;
	}

	return json;
})(current, message, attributes);
