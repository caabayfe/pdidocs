(function(finding) {

	var flagFinding = false;
	// get total number of user with HR Admin role
	var gaAdminUser = new GlideAggregate('sys_user_has_role');
	gaAdminUser.addQuery('role.name', 'sn_hr_core.admin');
	gaAdminUser.addAggregate('COUNT');
	gaAdminUser.query();
	if (gaAdminUser.next()) {
		//Check if delegated developer HR Core specific role exists
		var grRole = new GlideRecord('sys_user_role');
		grRole.addEncodedQuery('nameSTARTSWITHsn_dd_humanresourcescore');
		grRole.query();
		if (grRole.next()) {
			var grDelegate = new GlideRecord('sys_user_has_role');
			grDelegate.addEncodedQuery('role.nameSTARTSWITHsn_dd_humanresourcescore');
			//if at least one have that role then no findings will be added.
			grDelegate.query();
			if (!grDelegate.next()) {
				flagFinding = true;
			}
		} else {
			flagFinding = true;
		}

		//at least one hr admin should have delegate developer
		if (flagFinding) {
			finding.setCurrentSource(gaAdminUser);
			finding.increment();
		}
	}


})(finding);
