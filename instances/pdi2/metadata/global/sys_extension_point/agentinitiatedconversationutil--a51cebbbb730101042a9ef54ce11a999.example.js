var AgentInitiatedConversationUtil = Class.create();
AgentInitiatedConversationUtil.prototype = {
    initialize: function() {
    },
	
	isValid: function(channel_sysid) {
		/* custom implementation goes here */
    },

    getSendTo: function(channel_sysid, table, sys_id) {
		/* custom implementation goes here */
    },
	
	getSendFrom: function(channel_sysid) {
		/* custom implementation goes here */
	},

    type: 'AgentInitiatedConversationUtil'
};
