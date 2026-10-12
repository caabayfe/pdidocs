var SOWSidebarNotificationsUtilsSNC = Class.create();
SOWSidebarNotificationsUtilsSNC.prototype = {
    initialize: function() {},

    TABLES: {
        SYS_CS_COLLAB_USER: 'sys_cs_collab_user',
        SYS_CS_COLLAB_MEMBER: 'sys_cs_collab_member',
        SYS_CS_COLLAB_CHAT: 'sys_cs_collab_chat',
        SYS_CS_COLLAB_RECORD: 'sys_cs_collab_record',
        SYS_CS_COLLAB_MESSAGE: 'sys_cs_collab_message',
        SYS_CS_EXTERNAL_COLLAB_CHAT_MAP: 'sys_cs_external_collab_chat_map',
        SYS_CS_COLLAB_REQUESTER_MAPPING: 'sys_cs_collab_chat_requester',
        INCIDENT: 'incident'
    },

    FIELDS: {
        SYS_CREATED_BY: 'sys_created_by',
        DOCUMENT: 'document',
        TABLE: 'table',
        CALLER_ID: 'caller_id',
        USER_NAME: 'user_name',
        USER: 'user',
        MEMBER: 'member',
        COLLAB_USER: 'collab_user',
        NUMBER: 'number',
        SHORT_DESCRIPTION: 'short_description',
        URGENCY: 'urgency',
        COLLAB_CHAT: 'collab_chat',
        MESSAGE_TYPE: 'message_type',
        DELETED: 'deleted',
        SENT_BY_MEMBER: 'sent_by_member',
        STATUS: 'status',
        SYS_CREATED_ON: 'sys_created_on',
        SYS_UPDATED_ON: 'sys_updated_on',
        ACTIVE: 'active',
        STATE: 'state'
    },

    CHOICES: {
        OPEN: 'open',
        ACTION: 'action',
        CREATED: 'created',
        RESOLVED: 6
    },
    SFS_NOTIF_MIN_SUPPORTED_VERSION: 202501,

    // SFS OOB supports email notification from JAN 2025 version
    isSfsNotificationAvailable: function() {
        return this.shouldUptake() && gs.getProperty('sn_oe_sfs.notification.min_version', '') >= this.SFS_NOTIF_MIN_SUPPORTED_VERSION && gs.tableExists(this.TABLES.SYS_CS_COLLAB_REQUESTER_MAPPING);
    },

	shouldUptake: function() {
		return gs.getProperty("sn_sow_collab.uptake_sfs_notifications", "false") == "false";
	},

    sendEmails: function() {
        if (!(new SOWSidebarChatUtils().isSidebarSupportedOnSOW(null, null, false)))
            return;
        var collabRecordGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_RECORD);
        collabRecordGr.addQuery('collab_chat.state', this.CHOICES.OPEN);
        collabRecordGr.addEncodedQuery('collab_chat.last_sent_messageISNOTEMPTY');
        collabRecordGr.addQuery(this.FIELDS.TABLE, this.TABLES.INCIDENT);
        collabRecordGr.orderByDesc('collab_chat.sys_updated_on');
        collabRecordGr.query();
        var emailsData = {};
        while (collabRecordGr.next()) {
            var incidentGr = collabRecordGr.document.getRefRecord();
            if (incidentGr.isValidRecord()) {
                if (this.isIncidentResolvedOrClosed(incidentGr))
                    continue;
                var callerId = incidentGr.getValue(this.FIELDS.CALLER_ID);
                if (callerId) {
                    var memberGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_MEMBER);
                    memberGr.addActiveQuery();
                    memberGr.addQuery('collab_user.user', callerId);
                    memberGr.addQuery(this.FIELDS.TABLE, this.TABLES.INCIDENT);
                    memberGr.addQuery(this.FIELDS.DOCUMENT, incidentGr.getUniqueValue());
                    memberGr.addQuery('collab_chat.state', this.CHOICES.OPEN);
                    memberGr.addEncodedQuery('collab_chat.last_sent_messageNSAMEASlast_read_message^ORlast_read_messageISEMPTY');
                    memberGr.addEncodedQuery('collab_chat.last_sent_messageISNOTEMPTY');
                    memberGr.orderByDesc('collab_chat.sys_updated_on');
                    memberGr.query();
                    var chats = [],
                        incidents = [];
                    while (memberGr.next()) {
                        var chatId = memberGr.getValue(this.FIELDS.COLLAB_CHAT);
                        if (this.externalConversationExists(chatId))
                            continue;
                        var messageGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_MESSAGE);
                        messageGr.addQuery(this.FIELDS.COLLAB_CHAT, chatId);
                        messageGr.addQuery(this.FIELDS.MESSAGE_TYPE, '!=', this.CHOICES.ACTION);
                        if (memberGr.last_read_message) {
                            var lastReadMessageGr = memberGr.last_read_message.getRefRecord();
                            if (lastReadMessageGr && lastReadMessageGr.isValidRecord())
                                messageGr.addQuery(this.FIELDS.SYS_CREATED_ON, '>', lastReadMessageGr.getValue(this.FIELDS.SYS_CREATED_ON));
                        }

                        // Get only messages sent in last 24 hours
                        messageGr.addQuery(this.FIELDS.SYS_UPDATED_ON, '>', gs.daysAgo(1));
                        messageGr.addQuery(this.FIELDS.DELETED, false);
                        messageGr.addQuery(this.FIELDS.STATUS, 'IN', 'received,delivered');
                        messageGr.addQuery(this.FIELDS.SENT_BY_MEMBER, '!=', memberGr.getUniqueValue());
                        messageGr.setLimit(1);
                        messageGr.query();
                        if (messageGr.hasNext()) {
                            chats.push(chatId);
                            incidents.push(incidentGr.getUniqueValue());
                        }
                    }
                    if (chats.length) {
                        emailsData[callerId] = {
                            chatSysIds: emailsData[callerId] && emailsData[callerId].chatSysIds ? emailsData[callerId].chatSysIds.concat(chats) : chats,
                            incidentSysIds: emailsData[callerId] && emailsData[callerId].incidentSysIds ? emailsData[callerId].incidentSysIds.concat(incidents) : incidents,
                            callerGr: incidentGr.caller_id.getRefRecord()
                        };
                    }
                }
            }
            collabRecordGr.addQuery(this.FIELDS.DOCUMENT, '!=', incidentGr.getUniqueValue());
            collabRecordGr.query();
        }
        Object.keys(emailsData).forEach(function(callerId) {
            gs.eventQueue('sn_sow_collab.sidebar.new.messages', emailsData[callerId].callerGr, emailsData[callerId].incidentSysIds.join(','), emailsData[callerId].chatSysIds.join(','));
        });
    },

    sendFirstEmail: function(incidentGr, chatId) {
        if (!incidentGr || !incidentGr.isValidRecord() || !chatId)
            return;
        if (this.isIncidentResolvedOrClosed(incidentGr))
            return;
        if (!(new SOWSidebarChatUtils().isSidebarSupportedOnSOW(this.TABLES.INCIDENT, incidentGr.getUniqueValue())))
            return;
        if (this.externalConversationExists(chatId))
            return;
        var callerId = incidentGr.getValue(this.FIELDS.CALLER_ID);
        var memberGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_MEMBER);
        memberGr.addActiveQuery();
        memberGr.addQuery(this.FIELDS.TABLE, this.TABLES.INCIDENT);
        memberGr.addQuery(this.FIELDS.DOCUMENT, incidentGr.getUniqueValue());
        memberGr.addQuery('collab_user.user', callerId);
        memberGr.addQuery(this.FIELDS.COLLAB_CHAT, chatId);
        memberGr.setLimit(1);
        memberGr.query();
        if (memberGr.next()) {
            // Case covered: if requester has created the sidebar discussion
            if (memberGr.getValue(this.FIELDS.SYS_CREATED_BY) === incidentGr.caller_id.user_name)
                return;
            gs.eventQueue('sn_sow_collab.sidebar.discussion.created', incidentGr, callerId, chatId);
        }
    },

    shallSendFirstEmail: function(collabMember) {
        if (!collabMember || !collabMember.isValidRecord())
            return false;

        // For now, only incident table is targeted for requester experience
        var incidentSysId = collabMember.getValue(this.FIELDS.DOCUMENT);
        var incidentGr = new GlideRecord(this.TABLES.INCIDENT);
        if (!incidentSysId || !incidentGr.get(incidentSysId))
            return false;

        if (!(new SOWSidebarChatUtils().isSidebarSupportedOnSOW(this.TABLES.INCIDENT, incidentSysId)))
            return false;

        if (this.isIncidentResolvedOrClosed(incidentGr))
            return false;

        // Case covered: if requester is logged in into the system and joins the discussion
        var createdBy = collabMember.getValue(this.FIELDS.SYS_CREATED_BY);
        if (createdBy == incidentGr.caller_id.user_name)
            return false;

        var chatId = collabMember.getValue(this.FIELDS.COLLAB_CHAT);
        if (this.externalConversationExists(chatId))
            return false;
        if (collabMember.collab_user && collabMember.collab_user.user != incidentGr.getValue(this.FIELDS.CALLER_ID))
            return false;
        return true;
    },

    externalConversationExists: function(chatId) {
        if (!chatId)
            return false;

        // If an external conversation is created, a mapping of collab chat and external conversation is added to below table
        var externalChatMapGr = new GlideRecord(this.TABLES.SYS_CS_EXTERNAL_COLLAB_CHAT_MAP);
        externalChatMapGr.addQuery(this.FIELDS.COLLAB_CHAT, chatId);
        externalChatMapGr.addQuery(this.FIELDS.STATUS, this.CHOICES.CREATED);
        externalChatMapGr.setLimit(1);
        externalChatMapGr.query();
        return externalChatMapGr.hasNext();
    },

    isIncidentResolvedOrClosed: function(incidentGr) {
        if (!incidentGr || !incidentGr.isValidRecord())
            return;
        return (incidentGr.getValue(this.FIELDS.ACTIVE) == false || incidentGr.getValue(this.FIELDS.STATE) == this.CHOICES.RESOLVED);
    },

    type: 'SOWSidebarNotificationsUtilsSNC'
};
