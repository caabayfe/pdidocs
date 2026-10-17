var CloseChatWindowExtPoint = Class.create();
CloseChatWindowExtPoint.prototype = {
    initialize: function() {
    },

	/** 
	 * Determines if the interaction is for the specific BU's workspace or not. 
 	*/
    isValid: function(interactionSysId) {
		return false;
	},
	
	/**
	 * Determines if the chat window for an interaction should be displayed on the left of the workspace or hidden.
   * Returns true if hidden.
	 */
	shouldCloseChatWindow: function(interactionSysId) {
		return false;
	},

	/**
	 * Determines whether the chat panel is positioned differently from the default rendering on the left side of the workspace. 
   * This method needs to be implemented if shouldCloseChatWindow() returns false for any interaction.
	 */
	isOutsideChatShell: function(interactionSysId) {
		return false;
	},
	
    type: 'CloseChatWindowExtPoint'
};
