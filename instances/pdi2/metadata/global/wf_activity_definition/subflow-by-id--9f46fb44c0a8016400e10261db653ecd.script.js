// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

workflow.includeActivityDefinition('Subflow');

var Subflow_by_IDActivityHandler = Class.create();
Subflow_by_IDActivityHandler.prototype = Object.extendsObject(SubflowActivityHandler, {
   
   initialize: function() {
      SubflowActivityHandler.prototype.initialize.call(this);
   },

   _getSubflowID: function() {
      return workflow.eval(activity.vars.workflow_script);
   },
 
   type: 'Subflow_by_IDActivityHandler'
});
