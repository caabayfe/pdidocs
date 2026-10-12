// Delete the user approvals for a group when the group is deleted (cascade delete should do this for you, but there is a bug in 
// the current handling of this due to the task table being referenced as a 1-1 and a m-m reference from the sysapproval_approver 
// table causing the 1-1 to the group approval to be skipped)
removeUserApprovalsForGroup();

function removeUserApprovalsForGroup() {
   var gr = new GlideRecord('sysapproval_approver');
   gr.addQuery('group', current.sys_id);
   gr.deleteMultiple();
}
