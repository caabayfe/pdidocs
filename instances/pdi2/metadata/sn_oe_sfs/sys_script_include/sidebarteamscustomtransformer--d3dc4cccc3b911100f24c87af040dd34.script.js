var SidebarTeamsCustomTransformer = Class.create();
SidebarTeamsCustomTransformer.prototype = {
    initialize: function() {
    },
	_getCollabUserSender: function(sender) {
		var gr = new GlideRecord("sys_cs_collab_provider_user_profile");
		gr.addQuery("external_user_id", sender);
		gr.query();
		if (!gr.next()) {
			return null;
		}
		return gr.getValue("collab_user");
	},
	transformOutboundMessage: function(collabMessage) {
		var collabChatId = collabMessage.collabChatId;
		var payload = collabMessage.payload;
		var messageType = collabMessage.messageType;
		var version = '/v1.0';
		var replyPath = '';
		var parentMsgExternalId;

		if(collabMessage.parentMessageId != ''){
			parentMsgExternalId = this.getExternalMsgId(collabMessage.parentMessageId);
			version = '/beta';
			replyPath = '/replyWithQuote';
		}


		switch (messageType) {
			case 'text':
				return {
					content_type: "text",
					content: payload,
					collab_chat_id: collabChatId,
					attachments: [],
					message_ids: collabMessage.parentMessageId != '' ? [parentMsgExternalId.getValue()]: [],
					version,
					reply_path: replyPath
				};
			case 'rich':
				var parsedPayload = JSON.parse(payload);
				if(parsedPayload.uiType == "MultiAttachmentsControl")
					return {
						content_type: "html",
						content: parsedPayload.uiMetadata.message,
						collab_chat_id: collabChatId,
						attachments: parsedPayload.uiMetadata.attachments,
						message_ids: collabMessage.parentMessageId != '' ? [parentMsgExternalId.getValue()]: [],
						version,
						reply_path: replyPath
					};
				break;
			default:
				break;
		}

		return {};
	},
	transformInboundMessage: function(teamsMessage, teamsChangeType) {
		var chatInboundMessage = {};
		chatInboundMessage.externalChatId = teamsMessage.chatId;
		chatInboundMessage.externalMessageId = teamsMessage.id;
		chatInboundMessage.messageType = teamsMessage.messageType;
		chatInboundMessage.createdDateTime = teamsMessage.createdDateTime;
		chatInboundMessage.lastModifiedDateTime = teamsMessage.lastModifiedDateTime;
		chatInboundMessage.lastEditedDateTime = teamsMessage.lastEditedDateTime;
		chatInboundMessage.deletedDateTime = teamsMessage.deletedDateTime;
		var fromUser = teamsMessage.from;
		if (!fromUser || !fromUser.user || !fromUser.user.id) {
			gs.error("The message sender info is empty");
			return null;
		}
		//fromUser.user.id is external user id from sys_cs_collab_provider_user_profile
		chatInboundMessage.externalSenderId = fromUser.user.id;
		chatInboundMessage.userIdentityType = fromUser.user.userIdentityType;
		var body = teamsMessage.body;
		if (!body || (!body.content && teamsChangeType !== "deleted")) {
			gs.error("The message body is empty");
			return null;
		}
		chatInboundMessage.contentType = body.contentType;
		if (teamsChangeType === "deleted") {
			chatInboundMessage.content = "";
		} else {
			if (body.contentType === 'text') {
				chatInboundMessage.content = body.content;
			} else if (body.contentType === 'html') {
				// if message contains emoji, it should have itemtype="http://schema.skype.com/Emoji, use the alt value for emoji
				var emojiContent = body.content.replace(/<emoji.*?alt="(.*?)"[^>]+>/g, '$1');
				if (!emojiContent) {
					gs.debug("Message is empty after replace MS emoji with alt value");
					return null;
				}

				// Begin - remove below lines of code when implementing a feature similar to the one in STRY54989488.
				// remove all html tags from the content
				var contentWithoutTag = emojiContent.replace(/<[^>]*>?/g, '');
				// Append attachment URL to the content
				teamsMessage.attachments.forEach((attachment) => this.processAttachment(attachment, contentWithoutTag, chatInboundMessage));
				if (!contentWithoutTag) {
					gs.debug("Message is empty after remove all html tags");
					return null;
				} // End - remove below lines of code when implementing a feature similar to the one in STRY54989488.

				// uncomment below line of code when implementing a feature similar to the one in STRY54989488.
				//var content = sanitizeHTMLContent(emojiContent, teamsMessage.attachments);

				// unescape the message. e.g. &lt;h1&gt;hello&lt;/h1&gt; will be converted to <p>hello</p>
				// comment or remove below line of code when implementing a feature similar to the one in STRY54989488.
				var content = GlideStringUtil.unEscapeHTML(contentWithoutTag);

				if (!content) {
					gs.error("Message content is empty");
					return null;
				}
				chatInboundMessage.content = content;
			} else {
				gs.error("Message content type is not supported " + body.contentType);
				return null;
			}
		}
		//get collab user:
		chatInboundMessage.collabChatSender = this._getCollabUserSender(chatInboundMessage.externalSenderId);
		if (!chatInboundMessage.collabChatSender) {
			gs.error("No such collab user " + sender);
			return null;
		}
		return chatInboundMessage;
	},
	processAttachment: function(attachment, contentWithoutTag, chatInboundMessage) {
					if (attachment.contentUrl) {
						var urlWithSpace = attachment.contentUrl.replace(/[()[\] ]/g, function(c) {return '%' + c.charCodeAt(0).toString(16);});
						contentWithoutTag = contentWithoutTag + " " + urlWithSpace;
					}
					if(attachment.content) {
						var contentString = attachment.content.replace('\\"');
						var contentJson = JSON.parse(contentString);
						gs.info('before _getParentMsgId');
						var parentMsgId = this._getParentMsgId(contentJson.messageId);
						chatInboundMessage.externalParentId = parentMsgId;
					}
	},
	sanitizeHTMLContent: function(emojiContent, attachments) {
		var divTagEnd = '</div>';
		/* If using MS Teams through desktop app or web browser content is embedded inside <p></p>.
			* When rendered on Sidebar chat window it appends \n before and after the content.
			* Placing the content within <div></div> elimates \n getting appended before and after the content.
		*/
		emojiContent = emojiContent.replaceAll('<p>', '<div>').replaceAll('</p>', divTagEnd);
		var toBeSanitizedHtmlContent = emojiContent;
		var i = 0;
		var imgHtmlTagContent;
		// Append attachment URL to the to be sanitized html content
		attachments.forEach(function (attachment) {
			// when using hyperlink <a></a> content url is null
			if(attachment.contentUrl) {
				if(i == 0) {
					imgHtmlTagContent = toBeSanitizedHtmlContent.substring(toBeSanitizedHtmlContent.indexOf(divTagEnd) + divTagEnd.length);
					toBeSanitizedHtmlContent = toBeSanitizedHtmlContent.substring(0, toBeSanitizedHtmlContent.indexOf(divTagEnd));
					i++;
				}
				var urlWithSpace = attachment.contentUrl.replace(/[()[\] ]/g, function(c) {return '%' + c.charCodeAt(0).toString(16);});
				toBeSanitizedHtmlContent = toBeSanitizedHtmlContent + " " + "<a href=\"" + urlWithSpace + "\"" + " title=\"" + urlWithSpace + "\"" + " target=\"" + "_blank" + "\"" + " rel=\"" + "noopener noreferrer nofollow" + "\"" + ">" + urlWithSpace + "</a>";
			}
		});
		toBeSanitizedHtmlContent = toBeSanitizedHtmlContent + divTagEnd;
		if(imgHtmlTagContent) {
			toBeSanitizedHtmlContent = toBeSanitizedHtmlContent + imgHtmlTagContent;
		}
		// sanitize HTML tags
		var sanitizedHTMLContent = new global.CollabChatGlobalUtils().sanitizeHTML(toBeSanitizedHtmlContent);
		if (!sanitizedHTMLContent) {
			gs.debug("Message is empty after sanitizing all html tags");
			return null;
		}
		sanitizedHTMLContent = JSON.stringify({
			uiType: 'OutputHtml',
			value: sanitizedHTMLContent
		});
		// unescape the message. e.g. &lt;h1&gt;hello&lt;/h1&gt; will be converted to <p>hello</p>
		return GlideStringUtil.unEscapeHTML(sanitizedHTMLContent);
	},
	transformInboundMember: function(teamsMember) {
		var chatInboundMember = {};
		chatInboundMember.externalUserId = teamsMember.userId;
		chatInboundMember.email = teamsMember.email;
		chatInboundMember.tenantId = teamsMember.tenantId;
		chatInboundMember.id = teamsMember.id;
		chatInboundMember.roles = teamsMember.roles;
		chatInboundMember.displayName = teamsMember.displayName;
		chatInboundMember.visibleHistoryStartDateTime = teamsMember.visibleHistoryStartDateTime;
		chatInboundMember.user = teamsMember.user;
		chatInboundMember.collabUser = this._getCollabUserSender(teamsMember.userId);
		return chatInboundMember;
	},
	getExternalMsgId: function(collabChatMessageId) {
		var gr = new GlideRecord('sys_cs_external_collab_chat_message_map');
		gr.addQuery('collab_chat_message', collabChatMessageId);
		gr.query();
		if (!gr.next()) {
			return null;
		}
		return (gr.external_id);
	},
	_getParentMsgId: function(quotedMsgId) {
		var gr = new GlideRecord('sys_cs_external_collab_chat_message_map');
		if (!gr.get(quotedMsgId)) {
			return null;
		}
		var collabMessageId = gr.collab_chat_message;
		var messageGr = new GlideRecord('sys_cs_collab_message');
		if(!messageGr.get(collabMessageId)) {
			return null;
		}

		if(messageGr.parent_message.getValue() == null) { // quoted message is a parent msg
			return quotedMsgId;
		}
		// quoting a child message, use quoted message to get its parent message
		var parentMsgId = messageGr.parent_message.getValue();
		var extParentId = this.getExternalMsgId(parentMsgId);
		return extParentId.getValue();
	},
    type: 'SidebarTeamsCustomTransformer'
};
