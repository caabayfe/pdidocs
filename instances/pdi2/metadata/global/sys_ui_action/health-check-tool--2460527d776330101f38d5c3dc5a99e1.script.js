function openHealthCheckTool() {	
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	window.open('/flow_health_check.do?sysparm_sys_id='+sysId,"_blank");
}
