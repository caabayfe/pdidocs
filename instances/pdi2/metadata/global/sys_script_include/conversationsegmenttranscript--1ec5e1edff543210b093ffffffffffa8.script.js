var ConversationSegmentTranscript = Class.create();
ConversationSegmentTranscript.prototype = {
    initialize: function() {},

    getInternalTranscriptFromInteractionIdAndAgentSysId: function(interactionId, agentSysId) {
		var interactionGr = new GlideRecord('interaction');
		if(!interactionGr.get(interactionId)) {
			return "";
		}

		var converationId = interactionGr.getValue('channel_metadata_document');
		if(!converationId) {
			return "";
		}

        var conversationMemberGr = new GlideRecordSecure('sys_cs_conversation_member');
        conversationMemberGr.addQuery('conversation', converationId);
        conversationMemberGr.addQuery('member.user_document', agentSysId);
        conversationMemberGr.orderByDesc('sys_updated_on');
        conversationMemberGr.query();
        if (conversationMemberGr.next()) {
			return this.getInternalTranscriptByMemberId(conversationMemberGr.getUniqueValue());
		}
		return '';
    },

    getInternalTranscriptByMemberId: function(memberSysId) {
        var conversationMemberGr = new GlideRecord('sys_cs_conversation_member')
        if (!conversationMemberGr.get(memberSysId)) {
            return '';
        }

        var startMs = new GlideDateTime(conversationMemberGr.sys_created_on).getNumericValue();
        var endMs = new GlideDateTime(conversationMemberGr.end_time).getNumericValue();

        if (startMs && endMs) {
            const transcript = sn_cs.VASystemObject.getInternalTranscriptInDuration(conversationMemberGr.conversation.toString(), ['OutputCard'], startMs, endMs);
            return transcript;
        }
		return '';
    },

    type: 'ConversationSegmentTranscript'
};
