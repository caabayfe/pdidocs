var ConversationServerInteractionService = Class.create();
ConversationServerInteractionService.prototype = {
    initialize: function() {
    },
	
	isApplicable: function(interactionSysId) {
		// should be true only if this interaction is one that should be handled by your script
		// for example, if liveagent_application in the interaction context matches your application
		// if true, none of other scripts that implement this extension point will be called.
		return false;
	},

    getQueue: function(interactionSysId) {
		// returns the chat_queue (connect support queue) sys id that this interaction should be routed to
		// return null to default to the global value
        return null;
    },

    type: 'ConversationServerInteractionService'
};
