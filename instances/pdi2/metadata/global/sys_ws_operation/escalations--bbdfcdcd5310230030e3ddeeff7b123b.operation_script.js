(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var groupId = JSUtil.nil(request.queryParams.group_id) ? "" : request.queryParams.group_id;
	var rotaId = JSUtil.nil(request.queryParams.rota_id) ? "" : request.queryParams.rota_id;
	var escalationSetSysId = JSUtil.nil(request.queryParams.escalation_set_sys_id) ? "" : request.queryParams.escalation_set_sys_id;
	var taskTable = JSUtil.nil(request.queryParams.task_table) ? "" : request.queryParams.task_table;
	var taskSysId = JSUtil.nil(request.queryParams.task_sys_id) ? "" : request.queryParams.task_sys_id;
	var gdt;
	if (JSUtil.nil(request.queryParams.start_date))
		gdt = new GlideDateTime();
	else {
		gdt = new GlideDateTime();
		gdt.setDisplayValue(request.queryParams.start_date);
	}
	var escalationPathUtil = new OCEscalationPathUtil().setCheckAccess(true);
	return escalationPathUtil.getOnCallEscalationShift(groupId, rotaId, gdt, escalationSetSysId, taskTable, taskSysId);
})(request, response);
