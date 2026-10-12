// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Return_ValueActivityHandler = Class.create();
Return_ValueActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },

   onExecute: function() {
      var value = activity.vars.value + '';
      value = this.js(value);
      workflow.scratchpad.__return__ = value; // legacy return value location
      context.return_value.__return__ = value;
   },

   type: 'Return_ValueActivityHandler'
});
