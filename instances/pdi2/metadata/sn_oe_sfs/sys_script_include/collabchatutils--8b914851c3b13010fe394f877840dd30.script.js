var CollabChatUtils = Class.create();
CollabChatUtils.prototype = {
    initialize: function() {
    },
	isCollabChatMember: function (collabChatSysId, userSysId) {
		var gr = new GlideRecord("sys_cs_collab_member");
		gr.addQuery("collab_chat", collabChatSysId);
		gr.addQuery("member.user_document", userSysId);
		gr.query();
		return gr.next();
	},
	getCollabChatMember: function (collabChatSysId, userSysId) {
		var gr = new GlideRecord("sys_cs_collab_member");
		gr.addQuery("collab_chat", collabChatSysId);
		gr.addQuery("member.user_document", userSysId);
		gr.query();
		if (!gr.next())
			return null;
		return gr.getUniqueValue();
	},
	checkIsChatPrivate: function(collabChatSysId) {
		var gr = new GlideRecord("sys_cs_collab_chat");
		gr.addQuery("sys_id", collabChatSysId);
		gr.query();
		if (gr.next()) {
			return gr.is_chat_private;
		}
		return false;
	},
	canReadBaseRecord: function (collabChatSysId) {
		var isChatPrivate = this.checkIsChatPrivate(collabChatSysId);
		var isActiveCollabChatMember = this.isActiveCollabChatMember(collabChatSysId, gs.getUserID());
		var gr = new GlideRecord("sys_cs_collab_record");
		gr.addQuery("collab_chat", collabChatSysId);
		gr.query();
		if (!gr.next()) { //private standalone discussion has no sys_cs_collab_record
			return isActiveCollabChatMember;
		}
		if (!gr.canRead()) {
			return false;
		}
		if (!isChatPrivate || isActiveCollabChatMember) {
			return true;
		}
		return false;
	},
	isActiveCollabChatMember: function (collabChatSysId, userSysId) {
		var gr = new GlideRecord("sys_cs_collab_member");
		gr.addQuery("collab_chat", collabChatSysId);
		gr.addQuery("member.user_document", userSysId);
		gr.addActiveQuery();
		gr.query();
		return gr.next();
	},
	isMessageAudience: function(gr) {
		var message_audience = gr.message_audience + '';
		if (!gr.user_specific)
			return true;
		var collabMemberId = this.getCollabChatMember(gr.collab_chat, gs.getUserID());
		return collabMemberId != null && message_audience.split(',').indexOf(collabMemberId) > -1;
	},
	getSubscription: function(resource, subscriptions) {
		if (!subscriptions || subscriptions.length == 0)
			return null;

		for(var i = 0; i < subscriptions.length; i++) {
			var subscription = subscriptions[i];
			if (subscription.resource.includes(resource))
				return subscription;
		}

		return null;
	},
	getTeamsAppInfo: function(teamsChannelId) {
		var providerGR = new GlideRecord('sys_cs_collab_provider');
		providerGR.addQuery('channel', teamsChannelId);
		providerGR.addActiveQuery();
		providerGR.query();

		if (providerGR.next()) {
			var providerId = providerGR.getUniqueValue();
			var providerApplicationGR = new GlideRecord('sys_cs_collab_provider_application');
			providerApplicationGR.addQuery('provider', providerId);
			providerApplicationGR.addActiveQuery();
			providerApplicationGR.query();

			if (providerApplicationGR.next()) {
				return {
					'teamsAppId': providerApplicationGR.getValue('app_id'),
					'applicationId': providerApplicationGR.admin_connection.credential.oauth_entity_profile.oauth_entity.client_id
				};
			}
		}

		return null;
	},
	unSubscribeTeams: function(teamsChannelId) {
		var appInfo = this.getTeamsAppInfo(teamsChannelId);
		var teamsAppId = appInfo.teamsAppId;
		var applicationId = appInfo.applicationId;
		var allMembersResource = 'getAllMembers';
		var allMessagesResource = 'getAllMessages';

		var getChatSubScrResult = sn_fd.FlowAPI.executeActionQuick('sn_oe_sfs.get_chat_subscription', {
			application_id: applicationId
		});
		var subscriptions = JSON.parse(getChatSubScrResult.subscriptions);
		var subscriptionAllMembers = this.getSubscription(allMembersResource, subscriptions);
		var subscriptionAllMessages = this.getSubscription(allMessagesResource, subscriptions);
		if (subscriptionAllMembers !== null) {
			var unSubscriptionResultAllMembers = sn_fd.FlowAPI.executeActionQuick('sn_oe_sfs.unsubscribe_chat', {
				subscription_id: subscriptionAllMembers.id
			});
		}
		if (subscriptionAllMessages !== null) {
			var unSubscriptionResultAllMessages = sn_fd.FlowAPI.executeActionQuick('sn_oe_sfs.unsubscribe_chat', {
				subscription_id: subscriptionAllMessages.id
			});
		}
	},
	trimStringInputs: function(inputs) {
        for (var key in inputs) {
            if (inputs[key] && typeof inputs[key] == 'string') {
                inputs[key] = inputs[key].trim();
            }
        }
        return inputs;
    },
	checkMandatoryInputs: function(inputs, mandatoryInputs) {
        for (var inputName in mandatoryInputs) {
            if (!inputs[inputName]) {
                var errMsg =
                    mandatoryInputs[inputName] +
                    " is empty or null. Provide valid value for " + mandatoryInputs[inputName] + ".";
                gs.error(errMsg);
                throw new Error(errMsg);
            }
        }
    },
	processSubscriptionResponse: function(response, subscription) {
        subscription["id"] = response["id"];
        subscription["resource"] = response["resource"];
        subscription["creator_id"] = response["creatorId"];
        subscription["change_type"] = response["changeType"];
        subscription["notification_url"] = response["notificationUrl"];
        var expiry = response["expirationDateTime"] ?
            response["expirationDateTime"].split("T") :
            "";
        subscription["expiration_date_time"] =
            expiry[0] + " " + (expiry[1] ? expiry[1].slice(0, -1) : "");
    },
	convertDateToUTC: function(date) {
        var finalDate = "";
        try {
            var gtd = new GlideDateTime(date);
            gtd.addSeconds("0");
            var utcDateTime = gtd.getValue();
            var dateArray = utcDateTime.split(" ");
            finalDate = dateArray[0] + "T" + dateArray[1] + "Z";
            return finalDate;
        } catch (e) {
            finalDate = date;
            return finalDate;
        }
    },
	validateDate: function(date) {
        return date.match(
            /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
        );
    },
	exportPublicKeyToCertificate: function(publicKeyId, exportType) {
		return sn_collab.CollabChatScriptObject.exportPublicKeyToCertificate(publicKeyId, exportType);
	},
	// DEF0393202
	truncateAttachmentUrlParams: function(url) {
		var params = '&action=default&mobileredirect=true';
		var index = url.indexOf(params);
		if(index != -1) {
			url = url.substring(0, url.indexOf(params));
		}
		return url;
	},

	_updateCollabMessageRecord: function(messageId, genAILogId, value, additionalData) {
		let feedback = JSON.stringify({
			"value": value,
			"additionalData": additionalData
		});
		let gr = new GlideRecord("sys_cs_collab_message");
		if (gr.get(messageId)) {
			gr.setValue("feedback", feedback);
			return gr.update() != null;
		}
		return false;
	},

	_updateGenAILogRecord: function(genAILogId, feedbackValue, additionalData) {
		let input = {
			logId: genAILogId,
			feedback: feedbackValue,
			additionalData: additionalData
		};
		let genAIUtil = new sn_generative_ai.GenerativeAIUtil();
		genAIUtil.sendFeedback(input);
	},

	sendFeedback: function(messageId, genAILogId, value, additionalData) {
		this._updateGenAILogRecord(genAILogId, value, additionalData);
		return this._updateCollabMessageRecord(messageId, genAILogId, value, additionalData);
	},

	// Send email to the requester of a record (eg. incident.caller) when they have unread messages in the last 24 hours
    sendEmails: function() {
		var collabRecordGr = new GlideRecord("sys_cs_collab_record");
        collabRecordGr.addQuery('collab_chat.state', "open");
		collabRecordGr.addQuery('collab_chat.last_sent_message.sys_created_on', '>', gs.daysAgo(1));
        collabRecordGr.query();
        var emailsData = {};
        while (collabRecordGr.next()) {
            var recordGr = collabRecordGr.document ? collabRecordGr.document.getRefRecord() : null;
			if (this.isRecordNotActive(recordGr))
				continue;

			var collabChatId = collabRecordGr.getValue('collab_chat');
			if (this.externalConversationExists(collabChatId))
				continue;

			// Lookup requester role from sys_cs_collab_chat_requester mapping table for given record table
			var requesterUserFieldName = this.getRequesterMappingField(collabRecordGr.table);
			if (requesterUserFieldName == null) {
				continue;
			}

			var requesterId = recordGr.getValue(requesterUserFieldName);
			if (requesterId) {
				var userGr = new GlideRecord("sys_user");
				if (!userGr.get(requesterId)) {
					continue;
				}
				var memberGr = new GlideRecord("sys_cs_collab_member");
				memberGr.addActiveQuery();
				memberGr.addQuery('collab_user.user', requesterId);
				memberGr.addQuery('collab_chat', collabChatId);
				memberGr.addEncodedQuery('collab_chat.last_sent_messageNSAMEASlast_read_message^ORlast_read_messageISEMPTY');
				memberGr.query();

				if (memberGr.next()) {
					var record = {table: collabRecordGr.table + '', recordId: recordGr.getUniqueValue(), chatId: collabChatId};

					emailsData[requesterId] = {
						recordInfos: emailsData[requesterId] && emailsData[requesterId].recordInfos ? emailsData[requesterId].recordInfos.concat(record) : [record],
						requesterGr: userGr
					};
				}
			}
		}

        Object.keys(emailsData).forEach(function(requesterId) {
			gs.eventQueue('sn_oe_sfs.notify_unread_messages', emailsData[requesterId].requesterGr, JSON.stringify(emailsData[requesterId].recordInfos));
        });
    },

    getRequesterMappingField: function(tableName) {
		var mappingGr = new GlideRecord("sys_cs_collab_chat_requester");
		mappingGr.addActiveQuery();
		mappingGr.addQuery("table", tableName);
		mappingGr.orderBy("order");
		mappingGr.query();
		if (mappingGr.next()) {
			// Found exact match of record based on table name
			return mappingGr.requester;
		}

		var tableNames = this.getTableExtensions(tableName);
		mappingGr = new GlideRecord("sys_cs_collab_chat_requester");
		mappingGr.addActiveQuery();
		mappingGr.addQuery("table", 'IN', tableNames);
		mappingGr.addQuery("inherit", true);
		mappingGr.orderBy("order");
		mappingGr.query();
		if (mappingGr.next()) {
			return mappingGr.requester;
		}
		return null;
	},

	getTableExtensions: function(tableName) {
		var table = new GlideTableHierarchy(tableName);
		return table.getTables().toString();
    },

	// Send email to requester when added to a discussion
	// Also works when the collab member was removed and added back to the discussion
    sendEmailToRequesterWhenAddedToDiscussion: function(collabMember) {
        if (!collabMember || !collabMember.isValidRecord())
            return;
        var recordGr = collabMember.document ? collabMember.document.getRefRecord() : null;
		if (!recordGr)
			return;

		var chatId = collabMember.getValue('collab_chat');
        if (!chatId || this.isRecordNotActive(recordGr))
            return;
        if (this.externalConversationExists(chatId))
            return;

		// Lookup requester role from sys_cs_collab_chat_requester mapping table for given record table
		var table = recordGr.getTableName();
		var recordId = recordGr.getUniqueValue();
		var requesterUserFieldName = this.getRequesterMappingField(table);
		if (!requesterUserFieldName)
			return;

		var requesterId = recordGr.getValue(requesterUserFieldName);
		if (!requesterId)
			return;

        if (collabMember.collab_user && collabMember.collab_user.user != requesterId)
            return;

		var userGr = new GlideRecord("sys_user");
		if (!userGr.get(requesterId))
			return;

        // If requester is logged in into the system and joins the discussion
        var createdBy = collabMember.getValue("sys_created_by");
        if (createdBy == userGr.user_name)
            return;

        gs.eventQueue('sn_oe_sfs.notify_unread_new_member', userGr, JSON.stringify({table, recordId, chatId}));
    },

    externalConversationExists: function(chatId) {
        if (!chatId)
            return false;

        // If an external conversation in Teams or Slack is created,
		// a mapping of collab chat and external conversation is added here
        var externalChatMapGr = new GlideRecord("sys_cs_external_collab_chat_map");
        externalChatMapGr.addQuery("collab_chat", chatId);
        externalChatMapGr.addQuery("status", "created");
        externalChatMapGr.setLimit(1);
        externalChatMapGr.query();
        return externalChatMapGr.hasNext();
    },

    isRecordNotActive: function(recordGr) {
        if (!recordGr || !recordGr.isValidRecord())
            return true;

        return recordGr.getValue("active") == false;
    },

	type: 'CollabChatUtils'
};
