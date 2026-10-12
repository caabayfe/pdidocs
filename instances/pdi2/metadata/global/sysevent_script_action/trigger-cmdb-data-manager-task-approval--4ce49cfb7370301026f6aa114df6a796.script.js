var gr = new GlideRecord('cmdb_data_management_task');
gr.addQuery('sys_id', event.parm1.toString());
gr.query();

if (gr.next()) {
	var taskApprovalSubFlowHelper = new CMDBDataManagerTaskApprovalHelper();
	taskApprovalSubFlowHelper.triggerTaskApprovalSubFlow(gr);
}
