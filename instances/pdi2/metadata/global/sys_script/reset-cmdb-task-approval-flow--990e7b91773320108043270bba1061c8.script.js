(function executeRule(current, previous /*null when async*/ ) {
	var comment = 'Workflow has been reset since Assignment Group field has been modified'; //written to the approval_history
	var infoMessage = 'Assignment group has been updated. Please refresh this page to see the updated list of task approvers.';
    gs.addInfoMessage(gs.getMessage(infoMessage));
    // create a global variable lock on the current record
    // this will prevent triggering a second reset while the first reset is still in progress
    // lock will be release in a late running business rule called 'Workflow Release Lock'
    task_wf_lock = new GlideRecordLock(current);
    task_wf_lock.setSpinWait(50); //wait for lock
    if (task_wf_lock.get()) {
        gs.log('Reset cmdb task approval flow business rule is locking the ' + current.getDisplayValue() + ' during the workflow reset');
        new WorkflowApprovalUtils().reset(current, comment);
        var taskApprovalSubFlowHelper = new CMDBDataManagerTaskApprovalHelper();
        taskApprovalSubFlowHelper.triggerTaskApprovalSubFlow(current);
    }
})(current, previous);
