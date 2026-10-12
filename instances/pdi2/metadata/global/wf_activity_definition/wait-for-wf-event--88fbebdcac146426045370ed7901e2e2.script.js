// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Wait_for_WF_EventActivityHandler = Class.create();
Wait_for_WF_EventActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },

   onExecute: function() {
      workflow.registerForEvent(this.js(activity.vars.wait_for_event));
      activity.state = 'waiting';
   },
   
   onUnhandledEvent: function(eventName) {
	  var waitingForEventName = this.js(activity.vars.wait_for_event);
      if (eventName == waitingForEventName) {
         activity.state = "finished";
         activity.result = waitingForEventName;
      }
   },

   type: 'Wait_for_WF_EventActivityHandler'
});
