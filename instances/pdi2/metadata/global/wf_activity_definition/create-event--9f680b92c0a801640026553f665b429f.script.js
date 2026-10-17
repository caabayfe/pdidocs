// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Create_EventActivityHandler = Class.create();
Create_EventActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },

   onExecute: function() {
      // Get parm1 and parm2 from the parameter script
      var p1 = this.runScript(activity.vars.event_param1);
      var p2 = this.runScript(activity.vars.event_param2);

      gs.eventQueue(activity.vars.event_name.getDisplayValue(), current, p1, p2);
   },

   type: 'Create_EventActivityHandler'
});
