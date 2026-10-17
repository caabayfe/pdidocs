/**
 * Processes response from ONE API call.
 * For every service plan in one_api_service_plan table, there should be a output processor script.
 * Example 'oneApiResponse' -
 * {
 * 	'documentId' : 'conversationId',
 * 	'documentTable' : 'sys_cs_conversation',
 * 	'features' : {
 *	 	'feature1' : {
 * 			'response' : {
 * 				'key1' : 'value1'
 * 				'key2' : 'value2'
 * 			}
 * 			'requestPayload' : {
 * 				'csMessageId' : ''
 * 			}
 * 		},
 * 	}
 *
 * }
 * NOTE: You can include the following scriptable APIs in any of the methods of this class -
 *	1. Send custom messages to agent
 * 		var customMessage = new sn_cs.VACustomMessage();
 * 		customMessage.sendAlertToAgent("messageId", "I am an alert message");
 * 		customMessage.sendBannerToAgent("messageId", "I am a banner message");
 * 		customMessage.sendBubbleToAgent("messageId", "I am a bubble message");
 * 	2. Switch to live agent and do not resume conversation
 * 		sn_cs.VASystemObject.switchTopicByName(conversationId, "_live_agent_support_", "skip");
 * It is recommended that these scriptable APIs are called in the individual feature response output processors
 * Example feature response processor - <hosturl>/now/nav/ui/classic/params/target/sys_script_include.do%3Fsys_id%3Dc22f172653f60110a260ddeeff7b1275
 */
var RequesterSendsMessagePostProcessingOutputProcessor = Class.create();
RequesterSendsMessagePostProcessingOutputProcessor.prototype = {
    initialize: function() {
    },

	// Mandatory function in every processor. This method is called after a completed response is received from One API invocation.
	processCompleted: function(oneApiResponse) {
		
	},
	
	// Mandatory function in every processor. This method is called after an error response is received from One API invocation.
	processErrored: function(oneApiResponse) {
		
	},
	
	// Mandatory function in every processor. This method is called if the one api call is cancelled.
	processCancelled: function(oneApiResponse) {
		
	},

	shouldResume: function(oneApiResponse) {
		return false;
	},
	
    type: 'RequesterSendsMessagePostProcessingOutputProcessor'
};
