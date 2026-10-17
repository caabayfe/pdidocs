var UnifiedConversationUtil = Class.create();
UnifiedConversationUtil.prototype = {
	LEGACY_VERSION: '1.0.0',
	UDM_VERSION: '2.0.0',
	CS_CONVERSATION_TABLE: 'sys_cs_conversation',
	
    initialize: function(conversationId) {
		this.conversationId = conversationId;
    },
	
	/**
	 * The method is used to check the conversation is fully initialized.
	 *
	 * In legacy mode, this check is to ensure the handoff record is created for the conversation.
	 * If the handoff is not created and user tries to create a new Conversation scriptable object,
	 * an exception could be thrown.
	 */
	isInitialized : function() {
		if (this.isConversationUDMVersion()) {
			return true;
		}
		
		if (this.isConversationLegacyVersion()) {
			var liveGroupProfileId = sn_connect.Conversation.getLiveGroupProfileIdByInteractionMetadata(
				this.CS_CONVERSATION_TABLE,
				this.conversationId
			);
			
			return (!liveGroupProfileId) ? false : true;
		}
		
		return true;
	},
	
	getConversationVersion: function() {
		if (!this.conversationVersion) {
			this.conversationVersion = sn_connect.Conversation.getVersion(this.conversationId);
		}
		return this.conversationVersion;
	},
	
	isConversationLegacyVersion: function() {
		return this.LEGACY_VERSION == this.getConversationVersion();
	},
	
	isConversationUDMVersion: function() {
		return this.UDM_VERSION == this.getConversationVersion();
	},
	
    type: 'UnifiedConversationUtil'
};
