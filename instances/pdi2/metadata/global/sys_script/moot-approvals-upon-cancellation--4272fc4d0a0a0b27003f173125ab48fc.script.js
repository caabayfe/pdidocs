renderTaskApprovalsMoot();
function renderTaskApprovalsMoot() {
  // Do not remove this check, this is necessary double-checking.
  // Otherwise, there is a possibility of unexpected behaviour in approvals.
  if (JSUtil.nil(current) || JSUtil.nil(current.sys_id)) {
	  return;
  }
	
  var gr = new GlideRecord('sysapproval_approver');
  gr.addQuery('sysapproval', current.sys_id);
  var qc = gr.addQuery('state', 'requested');
  qc.addOrCondition('state', 'not requested');
  gr.query();
  while (gr.next()) {
    gr.state = 'not_required';
    gr.update();
  }
	
  gr = new GlideRecord('sysapproval_group');
  gr.addQuery('parent', current.sys_id);
  qc = gr.addQuery('approval', 'requested');
  qc.addOrCondition('approval', 'not requested');
  gr.query();
  while (gr.next()) {
    gr.approval = 'not_required';
    gr.update();
  }
}
