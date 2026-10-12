// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Run_ScriptActivityHandler = Class.create();
Run_ScriptActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   	initialize: function() {
    	WFActivityHandler.prototype.initialize.call(this);
   	},
   	
   	onExecute: function() {
		workflow.evaluateString(activity.vars.script, activity.name+" - advanced script", this); 
   	},
   	
  	type: 'Run_ScriptActivityHandler'
});
