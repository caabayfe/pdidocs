/**
 * This is the input processor that creates one api feature requests for requester message post processing.
 * 'input' in the methods below is a JSON which contains data required to create feature's request payload.
 * Example input -
 * {
 *    "vendorId": "c2f0b8f187033200246ddd4c97cb0bb9",
 *    "consumerAccountId": "bb225017c3742110634cdb450a40dd83",
 *    "deviceType": "mweb",
 *    "conversationId": "42591817c3302110634cdb450a40dda7",
 *    "csMessageId": "5179d817c3302110634cdb450a40ddd2",
 *    "text": "message from the requester"
 *    ...
 *    ...
 *  }
 *
 * NOTE: If you want to change/add inputs, you can do so in the feature's input processor. 
 * It is recommended that this service plan input processor remains default.
 * Example feature request processor -
 * <hosturl>/now/nav/ui/classic/params/target/sys_script_include.do%3Fsys_id%3Da65b5b2653f60110a260ddeeff7b1266
*/
var RequesterSendsMessagePostProcessingInputProcessor = Class.create();
RequesterSendsMessagePostProcessingInputProcessor.prototype = {
    initialize: function() {
    },

	process: function(input) {
		return input;
	},
	
	shouldPause: function(input) {
		return false;
	},
	
    type: 'RequesterSendsMessagePostProcessingInputProcessor'
};
