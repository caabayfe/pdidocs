// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var SwitchActivityHandler = Class.create();
SwitchActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
 
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
 
   onExecute: function() {
      if(activity.vars.type == "variable")
        activity.result = eval("current.variables." + activity.vars.item_variable.name);
      else
        activity.result = eval("current." + activity.vars.field);
   },
 
   type: 'SwitchActivityHandler'
});
