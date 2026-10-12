(function executeRule(current, previous /*null when async*/) {
	
	var appWizardSysId = '1ecf9a0e28e96e12a39fd11c51397fa4';
	var appWizard = new GlideRecord('sys_ux_lib_component');
	
	if (appWizard.get(appWizardSysId)) {
		current.setValue('ux_framework_component', appWizardSysId);
	}

})(current, previous);
