// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var EndActivityHandler = Class.create();
EndActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   	initialize: function() {
   		WFActivityHandler.prototype.initialize.call(this);
   	},

   	onExecute: function(eventParms) {
		workflow.end();
   	},
   	
   	onCancel: function(eventName, eventParms) {
   		//End never cancels
   		return;
   	},

   type: 'EndActivityHandler'
});
