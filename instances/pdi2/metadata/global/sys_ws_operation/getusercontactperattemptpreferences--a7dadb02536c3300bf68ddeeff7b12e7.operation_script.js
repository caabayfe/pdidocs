(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var groupId = "";
	var gdt = new GlideDateTime();
	var escalationLevel = "";
	var escalationSetId = "";
	var taskSysId = "";
	var taskTableName = "";
	var rotaId = "";
    if (JSUtil.notNil(request.pathParams.group_id))
		groupId = request.pathParams.group_id + "";
	if (JSUtil.notNil(request.queryParams.start_time))
		gdt.setDisplayValueInternal(request.queryParams.start_time + "");
	if (JSUtil.notNil(request.queryParams.escalation_level))
		escalationLevel = parseInt(request.queryParams.escalation_level + "");
	else
		escalationLevel = 0;
	if (JSUtil.notNil(request.queryParams.rota_id))
		rotaId = request.queryParams.rota_id + "";
	if (JSUtil.notNil(request.queryParams.escalation_set_id))
		escalationSetId = request.queryParams.escalation_set_id + "";
	if (JSUtil.notNil(request.queryParams.task_table_name))
		taskTableName = request.queryParams.task_table_name + "";
	if (JSUtil.notNil(request.queryParams.task_sys_id))
		taskSysId = request.queryParams.task_sys_id + "";
	
	var contactPrefUtils = new OnCallContactPreferenceUtil().setCheckAccess(true);
	return contactPrefUtils.getContactPreferenceAtEscalationLevel(groupId, escalationLevel, gdt, rotaId, escalationSetId, taskTableName, taskSysId);
})(request, response);
