// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Log_Trace_MessageActivityHandler = Class.create();
Log_Trace_MessageActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() {
      this.info("Workflow trace, activity: " + activity.name);
      this.info("Workflow trace, event: " + event);
      this.info("Workflow trace, GlideRecord: " + current.getTableName());
   },
   
   type: 'Log_Trace_MessageActivityHandler'
});
