var InteractionTypeUtil = Class.create();
InteractionTypeUtil.prototype = {
    initialize: function() {},

    getConversationInteractionTypes: function() {
        return ["chat", "messaging"];
    },

    /**
     * Used for deciding whether messages can be sent for an interaction. Always true for
     * conversational interaction types "chat" and "messaging", unless the associated
     * conversation record is no longer open. For other types, true only if there
     * is an associated conversation record that has a consumer_account with a
     * provider_application set (customer-adapter-enabled), except for NVC interactions
     * created via resiliency API.
     */
    canSendMessages: function(current) {
        if (new ArrayUtil().contains(this.getConversationInteractionTypes(), current.type)) {
            if ('sys_cs_conversation' == current.channel_metadata_table) {
                var convGR = new GlideRecord('sys_cs_conversation');
                convGR.addQuery('sys_id', current.channel_metadata_document);
                convGR.addEncodedQuery('stateINopen,chatInProgress,autoPilotInProgress');
                convGR.setLimit(1);
                convGR.setWorkflow(false);
                convGR.queryNoDomain();
                return convGR.hasNext();
            }
            return true;
        }

        if (current.type == 'phone' && current.resiliency_mode == true)
            return false;

		if ('sys_cs_conversation' != current.channel_metadata_table || gs.nil(current.channel_metadata_document))
			return false;

		var conversationGR = new GlideRecord('sys_cs_conversation');
		conversationGR.addQuery('sys_id', current.channel_metadata_document);
		conversationGR.addNotNullQuery('consumer_account.provider_application');
		conversationGR.addEncodedQuery('stateINopen,chatInProgress,autoPilotInProgress');
		conversationGR.setLimit(1);
		conversationGR.setWorkflow(false);
		conversationGR.queryNoDomain();
		return conversationGR.hasNext();
	},

    type: 'InteractionTypeUtil'
};
