// Approval was 'unapproved' or 'unrejected'

// Run any workflows for our parent so they can check the approval states
// fdt - 3.20.2011
// modified to use generic approval for any table via the document id/source_table, 
// the check for sysapproval remains to provide backwards compatibility for records already in 
// play that were entered into approval using the sysapproval to store taskID. 
// Going forward, all records will get a document_id and a source table, but if they are null, this
// function assumes sysapproval column in the task table.

runWorkflow_userUnapprove();

function runWorkflow_userUnapprove() {
	var approvalUtils = new WorkflowApprovalUtils();
	approvalUtils.unapprove();
}
