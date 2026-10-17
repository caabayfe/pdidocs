if (gs.hasRole("sn_employee.admin")) {
	answer = true;
	var isHRCoreActive = new GlidePluginManager().isActive("com.sn_hr_core");
	var commonFields = ep_Constants.HR_FIELDS;
	var field = root_rule.replace('sn_employee_profile.', '');
	if(isHRCoreActive && commonFields.indexOf(field) != -1)
		answer = false;
} else
	answer = false;
