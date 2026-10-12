var ConversationGraphQLUtil = Class.create();
ConversationGraphQLUtil.prototype = {
    initialize: function() {},

    getAudioTranscriptAttachmentId: function(interactionSysId) {
        var attachmentGr = new GlideRecord('sys_attachment');
        attachmentGr.addQuery("table_sys_id", interactionSysId);
        attachmentGr.addEncodedQuery("file_nameLIKE" + interactionSysId + "_recording^content_typeSTARTSWITHaudio");
        attachmentGr.query();

        if (attachmentGr.next()) {
            return attachmentGr.getValue("sys_id");
        }

        return "";
    },

    getConversationSentiment: function(conversationSysId) {
        var convGr = new GlideRecord('sys_cs_conversation');
        if (convGr.get(conversationSysId)) {
            return convGr.getValue('sentiment');
        }
        return '';
    },

    setLastReadMessage: function(interactionId, userId) {
        var interactionGR = new GlideRecordSecure('interaction');
        interactionGR.addQuery('sys_id', interactionId);
        interactionGR.query();
        if (interactionGR.next()) {
            var messageGR = new GlideRecordSecure('sys_cs_message');
            messageGR.addQuery('conversation', interactionGR.getValue('channel_metadata_document'));
            messageGR.addQuery('direction', 'outbound');
            messageGR.addQuery('is_agent', true);
            messageGR.addQuery('sender', userId);
            messageGR.orderBy('sequence');
			messageGR.setLimit(1);
            messageGR.query();
            if (messageGR.next()) {
                var tabDetailGR = new GlideRecordSecure('sys_cs_message_tab_detail');
                tabDetailGR.setValue('receiver', messageGR.getValue('sender'));
                tabDetailGR.setValue('interaction', interactionId);
                tabDetailGR.setValue('is_active', true);
                tabDetailGR.setValue('last_read_message_id', messageGR.getUniqueValue());
                tabDetailGR.insert();
                return "last read message-id updated";
            }
            return "no messages found";
        }
        return "interaction not found";
    },

    type: 'ConversationGraphQLUtil'
};
