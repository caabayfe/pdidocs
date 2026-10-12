// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Rollback_ToActivityHandler = Class.create();
Rollback_ToActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },

   onExecute: function() {
      workflow.debug('Rollback Complete for ' + current.sys_id );

     if (previous_activity && previous_activity.activity.sys_id){

          var model = new WorkflowModelManager(activity.context);
          model.getExecutedHistory();
          model.rollbackTransitionHistory(previous_activity.sys_id, activity.activity.sys_id.toString(), activity.activity_index);
          // set any rollback comment
          if (activity.vars.comment_field && activity.vars.comment) 
              current.getElement(activity.vars.comment_field.toString()).setDisplayValue(activity.vars.comment.toString());
      
		  // signal engine that roll-back finished.
		  workflow.onRollbackComplete(activity);
          workflow.debug('Rollback Complete for ' + current.sys_id );
     }
     
   },

   type: 'Rollback_ToActivityHandler'
});
