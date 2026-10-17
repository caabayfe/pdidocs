var SidebarSlackCustomTransformer = Class.create();
SidebarSlackCustomTransformer.prototype = {
    initialize: function() {
    },
	transformOutboundMessage: function(collabMessage) {
		var collabChatId = collabMessage.collabChatId;
		var payload = collabMessage.payload;
		var parentMsgExternalId;
		
		if(collabMessage.parentMessageId != ''){
			parentMsgExternalId = this._getExternalId(collabMessage.parentMessageId);
		}
		var messageType = collabMessage.messageType;
		switch (messageType) {
			case 'text':
				return {
					content_type: "text",
					content: payload,
					collab_chat_id: collabChatId,
					attachments: [],
					parent_msg_external_id: parentMsgExternalId == null ? '' :parentMsgExternalId.getValue(),
				};
			case 'rich':
				var parsedPayload = JSON.parse(payload);
				if(parsedPayload.uiType == "MultiAttachmentsControl")
					return {
						content_type: "html",
						content: parsedPayload.uiMetadata.message,
						collab_chat_id: collabChatId,
						attachments: parsedPayload.uiMetadata.attachments,
						parent_msg_external_id: parentMsgExternalId == null ? '' :parentMsgExternalId.getValue(),
					};
				break;
			default:
				break;
		}
	},
	transformInboundMessage: function(payload) {
		var chatInboundMessage = {};
		var event = payload.event;
		chatInboundMessage.externalChatId = event.channel;
		chatInboundMessage.resourceType = event.type == 'message' ? 'MESSAGES' : 'MEMBERS';
		chatInboundMessage.changeType = 'CREATED';

		if (event.type == 'message' && (event.subtype == 'channel_join' || event.subtype == 'channel_leave'))
			return;

		if (event.type == 'member_joined_channel')
			chatInboundMessage.changeType = 'CREATED';
		else if (event.type == 'member_left_channel')
			chatInboundMessage.changeType = 'DELETED';
		else if (event.subtype == 'message_changed')
			chatInboundMessage.changeType = 'UPDATED';
		else if (event.subtype == 'message_deleted')
			chatInboundMessage.changeType = 'DELETED';

		var message = {};

		if (event.type == 'message') {
			message.externalChatId = event.channel;
			message.messageType = 'text';
			message.contentType = 'text';
			message.createdDateTime = event.event_time;
			message.externalParentId = event.thread_ts;

			if (event.subtype == 'message_changed') {
				message.externalMessageId = event.previous_message.ts;
				message.collabChatSender = this._getCollabProviderUserGR(event.message.user)?.getValue("collab_user");
				message.externalSenderId = event.message.user;
				message.content = this._parseRichText(event.message);
			} else if (event.subtype == 'message_deleted') {
				message.externalMessageId = event.previous_message.ts;
				message.collabChatSender = this._getCollabProviderUserGR(event.previous_message.user)?.getValue("collab_user");
				message.externalSenderId = event.previous_message.user;
			} else if (event.subtype == 'file_share') {
				message.messageType = 'html';
				message.contentType = 'html';
				message.externalMessageId = event.ts;
				message.collabChatSender = this._getCollabProviderUserGR(event.user)?.getValue("collab_user");
				message.externalSenderId = event.user;

				var content = event.text;
				event.files.forEach(function(file) {
					content += ' ' + file.url_private_download;
				});

				message.content = content;
			} else {
				message.externalMessageId = event.ts;
				message.collabChatSender = this._getCollabProviderUserGR(event.user)?.getValue("collab_user");
				message.externalSenderId = event.user;
				message.content = this._parseRichText(event);
				message.externalParentId = event.thread_ts;
			}
		} else {
			var gr = this._getCollabProviderUserGR(event.user);
			message.externalUserId = event.user;
			message.displayName = gr.getValue('display_name');
			message.collabUser = gr.getValue('collab_user');
			message.user = gr.getValue('collab_user.user');
		}

		chatInboundMessage.message = message;

		return chatInboundMessage;
	},
	_parseRichText: function(event) {
		var blocks = event.blocks;
		if (!blocks || blocks.length == 0)
			return event.text;

		var richTextElements = blocks.filter(x => x.type == 'rich_text');
		if (richTextElements.length == 0)
			return event.text;

		var richText = richTextElements[0].elements;
		if (!richText || richText.length == 0)
			return event.text;

		var richTextSections = richText.filter(x => x.type = 'rich_text_section');
		if (richTextSections.length == 0)
			return event.text;

		var emojiSections = richTextSections[0].elements.filter(x => x.type == 'emoji');
		if (emojiSections.length == 0)
			return event.text;

		emojiSections.forEach(e => {
			event.text = event.text.replaceAll(':' + e.name + ':', String.fromCodePoint(parseInt(e.unicode, 16)));
		});

		return event.text;
	},
	_getCollabProviderUserGR: function(user) {
		var gr = new GlideRecord("sys_cs_collab_provider_user_profile");
		gr.addQuery("external_user_id", user);
		gr.query();
		if (!gr.next()) {
			return null;
		}
		return gr;
	},
	_getExternalId: function(collabChatMessageId) {
		var gr = new GlideRecord('sys_cs_external_collab_chat_message_map');
		gr.addQuery('collab_chat_message', collabChatMessageId);
		gr.query();
		if (!gr.next()) {
			return null;
		}
		return (gr.external_id);
	},
    type: 'SidebarSlackCustomTransformer'
};
