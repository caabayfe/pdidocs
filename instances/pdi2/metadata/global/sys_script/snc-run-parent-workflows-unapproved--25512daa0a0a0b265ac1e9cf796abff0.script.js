// The group approval was 'unapproved' or 'unrejected'

// Run any workflows for our parent so they can check the approval states
runWorkflow_groupUnapprove();

function runWorkflow_groupUnapprove() {
 var approvalUtils = new WorkflowApprovalUtils();
	approvalUtils.unapprove();
}
