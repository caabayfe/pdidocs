var InteractionSegmentConversation = Class.create();
InteractionSegmentConversation.prototype = {
    initialize: function() {},

    /**
     * Checks if extension point is applicable for the given interactionGr.
     *
     * @param {String} externalSegmentId - externalSegmentId identifier.
     * @param {GlideRecord} interactionGr - GlideRecord object for the interaction record.
     *
     * @return {Boolean} true/false - Returns true if the interaction is of type 'chat/messaging'.
     */
    isApplicable: function(externalSegmentId, interactionGr) {
        if (!gs.nil(interactionGr) && (interactionGr.getValue('type') === 'chat' || interactionGr.getValue('type') === 'messaging')) {
            return true;
        }
        return false;
    },

    /**
     * Gets segment details, or otherwise returns null.
     *
     * @param {String} externalSegmentId - externalSegmentId identifier.
     * @param {String} agentSysId - Agent sys Id.
     * @param {GlideRecord} interactionGr - GlideRecord object for the interaction record.
     *
     * @return {Object} - Returns the details of the segment, which includes the segment table and ID.
     * {
     * 	"segmentTable" : table name of segment.
     *  "segmentId" : sys ID of segment.
     * }
     */
    getSegment: function(externalSegmentId, agentSysId, interactionGr) {
        var warningMessage = 'getSegment: Missing or empty parameters.';
        return this._lookUpAndGetConversationSegment(externalSegmentId, agentSysId, interactionGr, warningMessage);
    },

    // Looks for an existing conversation segment with agentSysId matching conversation member id for the interaction's related record. 
    _lookUpAndGetConversationSegment: function(externalSegmentId, agentSysId, interactionGr, warningMessage) {
        if (gs.nil(agentSysId) || gs.nil(interactionGr)) {
            gs.warn(warningMessage);
            return null;
        }

        if (!(interactionGr.getValue('channel_metadata_document')) || !(interactionGr.getValue('channel_metadata_table'))) {
            gs.warn("_lookUpAndGetConversationSegment: Channel metadata is missing for the interaction.");
            return null;
        }

        if (interactionGr.getValue('channel_metadata_table') !== 'sys_cs_conversation') {
            gs.warn("_lookUpAndGetConversationSegment: Interaction is not conversation based.");
            return null;
        }

        try {
            var conversationMemberGr = new GlideRecordSecure('sys_cs_conversation_member');
            conversationMemberGr.addQuery('conversation', interactionGr.getValue('channel_metadata_document'));
            conversationMemberGr.addQuery('member.user_document', agentSysId);
            conversationMemberGr.orderByDesc('sys_updated_on');
            conversationMemberGr.query();
            if (conversationMemberGr.next()) {
                var segment = {};
                segment.segmentTable = 'sys_cs_conversation_member';
                segment.segmentId = conversationMemberGr.getValue('sys_id');
                return segment;
            }
        } catch (error) {
            gs.error("Error in _lookUpAndGetConversationSegment method: " + error);
        }
        return null;
    },

    /**
     * Retrieves the existing conversation segment.
     * Creation logic not implemented here. Returns null if no conversation segment exists.
     * 
     * @param {String} externalSegmentId - externalSegmentId identifier.
     * @param {String} agentSysId - Agent sys Id.
     * @param {GlideRecord} interactionGr - GlideRecord object for the interaction record.
     * 
     * @return null
     */
    createSegment: function(externalSegmentId, agentSysId, interactionGr) {
        var warningMessage = 'createSegment: Missing or empty parameters.';
        return this._lookUpAndGetConversationSegment(externalSegmentId, agentSysId, interactionGr, warningMessage);
    },

    type: 'InteractionSegmentConversation'
};
