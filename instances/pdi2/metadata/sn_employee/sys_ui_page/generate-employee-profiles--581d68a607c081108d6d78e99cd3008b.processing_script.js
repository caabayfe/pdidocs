if(cancelled==="false"){
	var epUtils = new ep_generateEmployeeProfileUtil();
	epUtils.resetLastExecutionTime();
	var executeJob = epUtils.triggerEmployeeProfileCreationJob(table_name);
	if(executeJob)
		gs.addInfoMessage(gs.getMessage("Employee profiles are being created. Thank you for your patience."));
	else
		gs.addInfoMessage(gs.getMessage("Unable to create employee profiles. Please try again."));
	response.sendRedirect("sn_employee_definition.do?sys_id=" + sysid);
}
