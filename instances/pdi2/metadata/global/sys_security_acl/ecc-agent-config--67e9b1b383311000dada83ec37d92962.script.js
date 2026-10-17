function isAccessControlledProperty(arr) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == current.name)
			return true;
	}
	return false;
}

var securityProperties = ["mid.log.command_audit.enable", "mid.log.command_audit.transfer_period", "mid.log.command_audit.buffer_size", "mid.log.command_audit.page_size", "mid.log.command_audit.size_control_strategy", "mid.audit.host_installed_services.enable"];
if (isAccessControlledProperty(securityProperties))
	answer = gs.hasRole("agent_security_admin");
else
	answer = true;
