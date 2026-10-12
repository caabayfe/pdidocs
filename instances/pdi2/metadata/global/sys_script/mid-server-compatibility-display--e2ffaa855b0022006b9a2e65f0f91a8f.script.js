(function executeRule(current, previous /*null when async*/) {
	
	var moreInfoI18n = gs.getMessage('More Info');
	var miv = ' <a target="_blank" href="'+gs.getProperty('help.base.servicenow')+'CSHelp:MIDServerUpgrades'+'">' + moreInfoI18n + '</a>';
	var miu = ' <a target="_blank" href="'+gs.getProperty('help.base.servicenow')+'CSHelp:SetUpMIDRole'+'">' + moreInfoI18n + '</a>';
	var miReq = ' <a target="_blank" href="'+gs.getProperty('help.base.servicenow')+'CSHelp:MIDSystemRequirements'+'">' + moreInfoI18n + '</a>';

	var vs = MidServerDashboardUtil.getVersionStatus(current.sys_id);
	var msgI18n = "";
	switch (vs.compatibility) {
		case MidServerDashboardUtil.COMPAT_UNKNOWN:
			msgI18n = gs.getMessage("Version compatibility could not be determined. Verify that the MID Server is configured as expected.");
			gs.addInfoMessage(msgI18n + miv);
			break;
		case MidServerDashboardUtil.COMPAT_COMPATIBLE:
			msgI18n = gs.getMessage("Reported MID Server version '{0}' differs from instance version '{1}' though they are compatible. Upgrade is recommended.", [vs.mid_version, vs.instance_version]);
			gs.addInfoMessage(msgI18n + miv);
			break;
		case MidServerDashboardUtil.COMPAT_INCOMPATIBLE:
			msgI18n = gs.getMessage("Reported MID Server version '{0}' is not compatible with instance version '{1}'. Upgrade is required.", [vs.mid_version, vs.instance_version]);
			gs.addErrorMessage(msgI18n + miv);
			break;
	}
	if (vs.pinned) {
		msgI18n = gs.getMessage("MID Server is pinned to version '{0}'. Verify this is the version you want to use.", vs.pinned_version);
		gs.addInfoMessage(msgI18n + miv);
	}
	
	var us = MidServerDashboardUtil.getUserStatus(current.sys_id);
	if (JSUtil.nil(us.logged_user))
		return;
	if (MidServerDashboardUtil.isMidConfigAvailable(current.sys_id) && !us.matches_config) {
		msgI18n = gs.getMessage("Logged in user '{0}' does not match configured user '{1}'. Check the MID Server user configuration.", [us.logged_user, us.config_user]);
		gs.addErrorMessage(msgI18n + miu);
	}

	if (us.is_missing_roles) {
		msgI18n = gs.getMessage("Logged in user '{0}' is missing the following roles: {1}. Add the missing roles to this user.", [us.logged_user, us.missing_roles.join(', ')]);
		gs.addErrorMessage(msgI18n + miu);
	}

	if (! MidServerDashboardUtil.hasMinimunPowerShellVersion(current.host_type, current.host_powershell_version)) {
		if (current.host_powershell_version)
			msgI18n = gs.getMessage("Detected PowerShell version '{0}' on the host does not meet the minimum required version. Check the related KB.", [current.host_powershell_version]);
		else 
			msgI18n = gs.getMessage("Unable to detect PowerShell version on the host machine. Check the MID Server Issue table and the related KB.");
		gs.addInfoMessage(msgI18n + miReq);
	}

})(current, previous);
