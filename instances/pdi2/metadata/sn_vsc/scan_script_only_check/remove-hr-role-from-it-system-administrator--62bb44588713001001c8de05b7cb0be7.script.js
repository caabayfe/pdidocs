(function(finding) {

	if (GlidePluginManager.isActive('com.sn_hr_core')) {
		var grRoleContains = new GlideRecord('sys_user_role_contains');
		grRoleContains.addQuery('role.name', 'IN', 'admin,security_admin');
		grRoleContains.addQuery('contains.name', 'sn_hr_core.admin');
		grRoleContains.query();
		while (grRoleContains.next()) {
			finding.setCurrentSource(grRoleContains);
			finding.increment();
		}
	}

})(finding);
