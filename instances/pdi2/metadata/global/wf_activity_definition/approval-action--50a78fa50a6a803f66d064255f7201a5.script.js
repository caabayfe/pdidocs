// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Approval_ActionActivityHandler = Class.create();
Approval_ActionActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },

   onExecute: function() {
 
     var approvalUtils = new WorkflowApprovalUtils();
     var apGr = approvalUtils.getApprovalRecord( current.sys_id );

     var col = 'approval';
     if( apGr.next() ){
         col = apGr.approval_column.nil() ? col : apGr.getValue('approval_column');
     }
    
     // implement activity definition code here
     var action = activity.vars.action;
     if (action == 'approved' || action == 'rejected' || action == 'requested')
         current.setValue(col,action);
     else if (action == 'moot') {       
         approvalUtils.setPendingGroupApprovalsByTask(current.sys_id, 'not_required');
         approvalUtils.setPendingUserApprovalsByTask(current.sys_id, 'not_required');
     }
 
   },

   type: 'Approval_ActionActivityHandler'
});
