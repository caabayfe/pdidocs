// Set all of the pending user approvals for this group approval to requested
var util = new WorkflowApprovalUtils();
util.setPendingUserApprovalsByGroup(current.sys_id, 'requested');
