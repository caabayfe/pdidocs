(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {

  var chatMessageSysId = current.getValue('target');
	var chatMessageGR = new GlideRecord('sys_cs_collab_message');
	chatMessageGR.get(chatMessageSysId);

	var chatId = chatMessageGR.getValue('collab_chat');

	var chatUrl = "now/sidebar-mobile/chat/" + chatId;

	var dlg = new global.MobileDeepLinkGenerator('agent');
	var link = dlg.getUrlLink(chatUrl);

	var payloadStringified = chatMessageGR.getValue('payload');
	var payload = JSON.parse(payloadStringified);

	var title = gs.getMessage('New mention in Sidebar');

	var json = {
		"aps": {
			"alert": {
				"title": title,
				"body": message
			},
			"sound": "default",
			"thread-id": "sidebar-mention-group"
		},
		"type": "sidebar-mention",
		"uiNotificationInboxSysId": current.sys_id,
		"Link": link,
		"ChatMessagePayload": payload,
		"Layout" : {
			"Status": { "Label": title }
		}
	};

	return json;

})(current, message, attributes);
