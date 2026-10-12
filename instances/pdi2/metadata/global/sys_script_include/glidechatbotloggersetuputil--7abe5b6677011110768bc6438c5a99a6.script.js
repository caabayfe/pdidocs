/* This is a Conversational Server specific logging framework with log context to increase visibility to specific conversation, interaction, etc.

Example Usage: 

var logger = new GlideChatbot("com.glide.cs").setup(conversationSysID, interactionSysID); 
logger.info("Test Log."); or 
logger.debug("Test Debug Log"); or 
logger.error("Test Error Log"); 

*/
var GlideChatbotLoggerSetupUtil = Class.create();
GlideChatbotLoggerSetupUtil.prototype = {
    initialize: function(scopeName) {
		this.scopeName = scopeName; 
	},
	
	setup: function(conversationSysID, interactionSysID) { 
		var contextMap = {"app": "CI", "track": "VA", "conversation": conversationSysID, "interaction": interactionSysID}; 
		var printableContext = ["app", "track", "conversation", "interaction"];
		var logger = new sn_log.GlideLogger(this.scopeName, contextMap, printableContext);
		
		return logger; 
	},

    type: 'GlideChatbotLoggerSetupUtil'
};
